import { Injectable, Logger } from '@nestjs/common';
import { WBProduct } from '../dto/WBProduct';
import axios from 'axios';

@Injectable()
export class ParserFetchService {
    private readonly logger = new Logger(ParserFetchService.name);

    async fetchJson(url: string) {
        try {
            const response = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            return response.data;
        } catch (error) {
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

}