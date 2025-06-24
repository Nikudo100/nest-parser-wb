import { Injectable, Logger } from '@nestjs/common';
import { WBProduct } from '../dto/WBProduct';
import axios from 'axios';

@Injectable()
export class ParserFetchService {
    private readonly logger = new Logger(ParserFetchService.name);

    async fetchJson(url: string) {
        try {
            // Build proxy config if environment variables are set
            const proxyConfig = process.env.PROXY_IP && process.env.PROXY_PORT &&
                process.env.PROXY_LOGIN && process.env.PROXY_PASSWORD ? {
                host: process.env.PROXY_IP,
                port: parseInt(process.env.PROXY_PORT || '0'),
                auth: {
                    username: process.env.PROXY_LOGIN,
                    password: process.env.PROXY_PASSWORD
                }
            } : undefined;

            // Log proxy configuration for debugging
            this.logger.debug(`Using proxy configuration: ${JSON.stringify(proxyConfig)}`);

            // Make request to check IP before main request
            const ipCheckResponse = await axios.get('https://api.ipify.org?format=json', {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                ...(proxyConfig && { proxy: proxyConfig })
            });
            this.logger.log(`Current IP address: ${ipCheckResponse.data.ip}`);

            // Make the actual request
            const response = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                ...(proxyConfig && { proxy: proxyConfig })
            });

            return response.data;
        } catch (error) {
            this.logger.error(`Failed to fetch data: ${error.message}`);
            throw new Error(`Error fetching JSON: ${error.message}`);
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

        for (let i = 1; i <= 99; i++) {
            const subdomain = i.toString().padStart(2, '0');
            const url = `https://basket-${subdomain}.wbbasket.ru/vol${vol}/part${part}/${nmId}/info/ru/card.json`;

            try {
                const data = await this.fetchJson(url);
                this.logger.log(`Successfully fetched data from URL: ${url}`);

                return { data, url };
            } catch (error) {
                if (!error.message.includes('404')) {
                    this.logger.error(`Error fetching from URL: ${url}. Error: ${error.message}`);
                    throw new Error(`Ошибка при получении card.json: ${error.message}`);
                }
                this.logger.warn(`404 Not Found for URL: ${url}`);
            }
        }
    }
}