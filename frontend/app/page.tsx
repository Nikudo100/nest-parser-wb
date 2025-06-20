'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

interface Color {
  id: number;
  name: string;
}

interface Product {
  id: number;
  nmId: number;
  imtId: number;
  name: string;
  brand: string;
  image: string;
  supplier: string;
  supplierId: number;
  supplierRating: number;
  rating: number;
  reviewRating: number;
  feedbacks: number;
  price: number;
  totalQuantity: number;
  is_our_product: boolean;
  colors: Color[];
  parsedAt: string;
}

export default function Home() {
  const [count, setCount] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('http://localhost:3004/parser/count');
        const json = await res.json();
        setCount(json.count);
      } catch (err) {
        console.error('Error fetching count:', err);
      }
    }
    
    async function fetchProducts() {
      try {
        const res = await fetch('http://localhost:3004/parser/products');
        const json = await res.json();
        setProducts(json);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    }

    fetchProducts();
    fetchCount();
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <h1>Products from API:</h1>
        {products === null ? (
          <p>Loading...</p>
        ) : (
          <div>
            {products.map(product => (
              <div key={product.id} className={styles.product}>
                <h2>{product.name}</h2>
                <p>Brand: {product.brand}</p>
                <p>Price: {product.price} RUB</p>
                <p>Rating: {product.rating}</p>
                <p>Feedbacks: {product.feedbacks}</p>
                <p>Всего на слакде: {product.totalQuantity}</p>
                <img
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain' }}
                  />
                <div>
                  {/* <p>Colors:</p>
                  <ul>
                    {Array.isArray(product.colors) ? product.colors.map(color => (
                      <li key={color.id}>{color.name}</li>
                    )) : <li>No colors available</li>}
                  </ul> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}