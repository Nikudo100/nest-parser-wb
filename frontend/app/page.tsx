'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  feedbacks: number;
  image: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const take = 20;

  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    minFeedbacks: '',
  });

  useEffect(() => {
    const query = new URLSearchParams({
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      minFeedbacks: filters.minFeedbacks,
      skip: String((page - 1) * take),
      take: String(take),
    }).toString();

    fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/parser/products?${query}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch(err => console.error('Fetch error:', err));
  }, [filters, page]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Парсер конкурентов</h1>
      <br />
      <h2>Фильтры</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Brand"
          value={filters.brand}
          onChange={e => setFilters({ ...filters, brand: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Min Rating"
          value={filters.minRating}
          onChange={e => setFilters({ ...filters, minRating: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Min Feedbacks"
          value={filters.minFeedbacks}
          onChange={e => setFilters({ ...filters, minFeedbacks: e.target.value })}
        />
      </div>
      <br />
      <h2>Товары</h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Картинка</th>
              <th className="p-2 border text-left">Названи</th>
              <th className="p-2 border text-left">Бренд</th>
              <th className="p-2 border">Цена</th>
              <th className="p-2 border">Рейтинг</th>
              <th className="p-2 border">Отзывы</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="p-2 border">
                  <img
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain' }}
                    className="w-16 h-16 object-contain"
                  />
                </td>
                <td className="p-2 border">{product.name}</td>
                <td className="p-2 border">{product.brand}</td>
                <td className="p-2 border text-center">{product.price} ₽</td>
                <td className="p-2 border text-center">{product.rating}</td>
                <td className="p-2 border text-center">{product.feedbacks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ← Previous
        </button>
        <span>
          Page {page} / {Math.ceil(total / take)}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage(p => p + 1)}
          disabled={page * take >= total}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
