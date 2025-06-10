import { Injectable } from '@nestjs/common';
import { WBProduct } from '../dto/WBProduct';
import axios from 'axios';

@Injectable()
export class ParserFetchService {

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

    async fetchProductCard(nmId: number): Promise<WBProduct> {
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
}