import { Injectable, Logger } from '@nestjs/common';
import { WBProduct } from '../dto/WBProduct';
import axios from 'axios';
import * as tunnel from 'tunnel';
import pLimit from 'p-limit';
import { SocksProxyAgent } from 'socks-proxy-agent';

@Injectable()
export class ParserFetchService {
    private readonly logger = new Logger(ParserFetchService.name);

    async fetchJson(url: string) {
      try {
        const {
          PROXY_IP,
          PROXY_PORT,
          PROXY_LOGIN,
          PROXY_PASSWORD
        } = process.env;
    
        const useProxy = PROXY_IP && PROXY_PORT && PROXY_LOGIN && PROXY_PASSWORD;
        let agent: any = undefined;
    
        if (useProxy) {
          const proxyUrl = `socks5h://${PROXY_LOGIN}:${PROXY_PASSWORD}@${PROXY_IP}:${PROXY_PORT}`;
          agent = new SocksProxyAgent(proxyUrl);
        }
    
        const response = await axios.get(url, {
          httpAgent: agent,
          httpsAgent: agent,
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
          validateStatus: () => true // Важно — чтобы самому обрабатывать 404
        });
    
        if (response.status === 404) {
          throw new Error(`404 Not Found`);
        }
    
        if (response.status < 200 || response.status >= 300) {
          throw new Error(`HTTP error ${response.status}`);
        }
    
        return response.data;
    
      } catch (error) {
        this.logger.error(`Failed to fetch data from ${url}: ${error.message}`);
        throw error;
      }
    }

      async testProxy(): Promise<boolean> {
        try {
          const testUrls = [
            'https://api.ipify.org?format=json',
            'https://httpbin.org/ip',
            'https://api.myip.com'
          ];
      
          for (const url of testUrls) {
            try {
              const response = await this.fetchJson(url);
              const ip = response.ip || response.origin || response.ipAddress;
              this.logger.log(`Proxy test successful for ${url}. IP: ${ip}`);
              return true;
            } catch (error) {
              this.logger.warn(`Failed to test proxy with ${url}: ${error.message}`);
              continue;
            }
          }
      
          return false;
        } catch (error) {
          this.logger.error(`Proxy test failed: ${error.message}`);
          return false;
        }
      }

    async fetchProduct(nmId: number): Promise<WBProduct> {
        const url = `https://card.wb.ru/cards/v2/detail?appType=1&curr=rub&dest=-1257786&spp=30&hide_dtype=13&ab_testing=true&lang=ru&nm=${nmId}`;
        try {
            const data = await this.fetchJson(url);
            const product = data?.data?.products?.[0];

            if (!product) {
                throw new Error('Товар не найден');
            }

            return product;
        } catch (error) {
            throw new Error(`Ошибка при получении товара: ${error.message}`);
        }
    }

    async fetchRecommended(nmId: number): Promise<WBProduct[]> {
        let page = 1;
        let allProducts: WBProduct[] = [];

        while (true) {
            this.logger.log(`page: ${page}`);

            const url = `https://recom.wb.ru/visual/ru/common/v5/search?appType=1&curr=rub&dest=-1257786&hide_dtype=13&lang=ru&page=${page}&query=${nmId}&resultset=catalog&spp=30&suppressSpellcheck=false`;

            try {
                const data = await this.fetchJson(url);
                const products = data?.data?.products as WBProduct[];

                if (!products || products.length === 0) {
                    break;
                }
                const filtered = products.filter(
                    p => (p.supplierRating ?? 0) > 4 && (p.feedbacks ?? 0) > 300
                );

                allProducts.push(...filtered);

                page++;
            } catch (error) {
                throw new Error(`Ошибка при получении товара: ${error.message}`);
            }
        }

        return allProducts;
    }

    async fetchCard(nmId: number) {
        const vol = Math.floor(nmId / 100000);
        const part = Math.floor(nmId / 1000);
        const limit = pLimit(5); // Maximum 3 concurrent requests

        // Array to store all running promises and their abort controllers
        const runningPromises: { promise: Promise<any>; controller: AbortController }[] = [];
        let foundResult = false;

        // Create and execute promises sequentially
        for (let i = 0; i < 30; i++) {
            if (foundResult) break;

            const controller = new AbortController();
            const subdomain = (i + 1).toString().padStart(2, '0');
            const url = `https://basket-${subdomain}.wbbasket.ru/vol${vol}/part${part}/${nmId}/info/ru/card.json`;

            const promise = limit(async () => {
                try {
                    const data = await this.fetchJson(url);
                    this.logger.log(`Successfully fetched data from URL: ${url}`);
                    foundResult = true;
                    
                    // Abort all other running requests
                    runningPromises.forEach(p => p.controller.abort());
                    
                    return { data, url };
                } catch (error) {
                    if (!error.message.includes('404')) {
                        this.logger.error(`Error fetching from URL: ${url}. Error: ${error.message}`);
                    }
                    this.logger.warn(`404 Not Found for URL: ${url}`);
                    return null;
                }
            });

            runningPromises.push({ promise, controller });

            // Check this promise for result
            try {
                const result = await promise;
                if (result) {
                    return result;
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    continue;
                }
                this.logger.error(`Unexpected error: ${error.message}`);
            }
        }

        return undefined;
    }
}