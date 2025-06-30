'use client';

import { useEffect, useState } from 'react';

interface Cart {
  vendorCode: string;
}

interface Product {
  id: number;
  nmId: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  feedbacks: number;
  image: string;
  is_our_product: string;
  cart?: Cart;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const take = 20;

  const [filters, setFilters] = useState({
    nmId: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    minFeedbacks: '',
    isOur: false,
  });

  const handleSoftDelete = async (id: number) => {
    if (!confirm('Удалить этот товар?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/parser/product/softDelete/${id}`);
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        console.error('Ошибка при удалении:', await res.text());
      }
    } catch (err) {
      console.error('Ошибка при удалении:', err);
    }
  };

  const [selectedOurNmId, setSelectedOurNmId] = useState<number | null>(null);

  const addCompetitor = async (competitorNmId: number) => {
    if (!selectedOurNmId) {
      alert("Сначала выберите наш товар (is_our_product)");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/parser/product/${selectedOurNmId}/add-competitors-by-nmId`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitorNmIds: [competitorNmId]
        })
      });

      if (response.ok) {
        alert("Конкурент добавлен");
      } else {
        alert("Ошибка при добавлении конкурента");
      }
    } catch (error) {
      console.error('Error adding competitor:', error);
      alert("Ошибка при добавлении конкурента");
    }
  };

  const [lastPageBeforeFilter, setLastPageBeforeFilter] = useState(1);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/parser/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isOur: filters.isOur,
        nmId: filters.nmId,
        brand: filters.brand,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
        minFeedbacks: filters.minFeedbacks,
        skip: (page - 1) * take,
        take: take,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch(err => console.error('Fetch error:', err));
  }, [filters, page]);

  useEffect(() => {
    const hasActiveFilters = Object.values(filters).some((v) => v !== '');

    if (hasActiveFilters) {
      if (page !== 1) {
        setLastPageBeforeFilter(page);
        setPage(1);
      }
    } else {
      if (lastPageBeforeFilter !== page) {
        setPage(lastPageBeforeFilter);
      }
    }
  }, [filters]);

  return (
    <div className="container mx-auto max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Парсер конкурентов</h1>
      <div className="p-4 mb-6 bg-white rounded-lg border border-gray-200 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-700">Фильтры</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {(['nmId', 'brand', 'minPrice', 'maxPrice', 'minRating', 'minFeedbacks'] as const).map((key) => (
            <input
              key={key}
              className="p-2 w-full text-sm rounded border border-gray-300 focus:ring focus:ring-blue-200"
              type={key.includes('Price') || key.includes('Rating') || key.includes('Feedbacks') ? 'number' : 'text'}
              placeholder={key === 'nmId' ? 'Номенклатура' : 
                         key === 'brand' ? 'Бренд' :
                         key === 'minPrice' ? 'Мин. цена' :
                         key === 'maxPrice' ? 'Макс. цена' :
                         key === 'minRating' ? 'Мин. рейтинг' :
                         key === 'minFeedbacks' ? 'Мин. отзывов' : key}
              value={filters[key] || ''}
              onChange={e => setFilters({ ...filters, [key]: e.target.value })}
            />
          ))}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOur"
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={filters.isOur}
              onChange={e => setFilters({ ...filters, isOur: e.target.checked })}
            />
            <label htmlFor="isOur" className="ml-2 text-sm text-gray-700">
              Только наши продукты
            </label>
          </div>
        </div>
      </div>

      {selectedOurNmId && (
        <div className="p-3 mb-4 text-green-800 bg-green-100 rounded border border-green-300">
          Вы выбрали товар nmId: <strong>{selectedOurNmId}</strong> как «наш». Теперь можно добавлять к нему конкурентов.
        </div>
      )}

      <div className="flex justify-center">
        <table className="min-w-full text-sm text-left rounded shadow border-collapse">
          <thead className="text-gray-700 bg-gray-100">
            <tr>
              <th className="p-3 border">Картинка</th>
              <th className="p-3 border">nmId / Артикул</th>
              <th className="p-3 border">Название</th>
              <th className="p-3 border">Бренд</th>
              <th className="p-3 text-center border">Цена</th>
              <th className="p-3 text-center border">Рейтинг</th>
              <th className="p-3 text-center border">Отзывы</th>
              <th className="p-3 text-center border">Удалить</th>
              <th className="p-3 text-center border">Похожие</th>
            </tr>
          </thead>
          <tbody>
            {/* 123 */}
            {products.map((product) => (
              <tr key={product.id} className="transition even:bg-gray-50 hover:bg-gray-100">
                <td className="p-2 text-center border">
                  <img
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain' }}
                    src={product.image || '/placeholder.png'}
                    alt={product.image}
                    // alt={product.name}
                    className="object-contain z-50 mx-auto w-40 h-40 bg-white rounded border transition-transform duration-200 transform hover:scale-250"
                  />
                </td>
                <td className="p-2 border">
                  <a 
                    target="_blank" 
                    href={`https://www.wildberries.ru/catalog/${product.nmId}/detail.aspx?targetUrl=SP`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {product.nmId}
                  </a>
                  {product.cart?.vendorCode && (
                    <div className="mt-1 text-sm text-gray-600">
                      Артикул: {product.cart.vendorCode}
                    </div>
                  )}
                </td>
                <td className="p-2 border">{product.name}</td>
                <td className="p-2 border">{product.brand}</td>
                <td className="p-2 text-center border">{product.price} ₽</td>
                <td className="p-2 text-center border">{product.rating}</td>
                <td className="p-2 text-center border">{product.feedbacks}</td>
                <td className="p-2 text-center border">
                  <button
                    className="px-3 py-1 text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-red-400 focus:outline-none active:bg-red-700"
                    onClick={() => handleSoftDelete(product.id)}
                  >
                    <span className="text-lg">×</span>
                  </button>
                </td>
                <td className="p-2 text-center border">
                  {product.is_our_product ? (
                    <div className="space-y-3">
                      <button
                        className={`px-4 py-2 rounded-lg shadow-md transition-all duration-200 ${
                          selectedOurNmId === product.nmId
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200'
                            : 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-100'
                        } hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-2 focus:ring-green-400 focus:outline-none active:scale-95`}
                        onClick={() => setSelectedOurNmId(product.nmId)}
                      >
                        {selectedOurNmId === product.nmId ? '✓ Выбран' : '🏷 Наш товар'}
                      </button>
                      <br/>
                      <br/>
                      <a
                        href={`/products/${product.nmId}/competitors`}
                        className="inline-block px-4 py-2 text-blue-600 bg-blue-50 rounded-lg shadow-sm transition-colors duration-200 hover:bg-blue-100 hover:shadow group"
                      >
                        Смотреть похожие
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </a>
                    </div>
                  ) : (
                    <button
                      className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none active:scale-95"
                      onClick={() => addCompetitor(product.nmId)}
                    >
                      <span className="flex justify-center items-center">
                        <span className="mr-1 text-lg">+</span> Похожий
                      </span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="flex justify-between items-center mt-6">
        <button
          className="px-6 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          <span className="flex items-center text-gray-700">
            <span className="mr-1">←</span> Назад
          </span>
        </button>
        <span className="px-4 py-2 text-gray-600 bg-white rounded-lg shadow-sm">
          Страница {page} из {Math.ceil(total / take)}
        </span>
        <button
          className="px-6 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300"
          onClick={() => setPage((p) => p + 1)}
          disabled={page * take >= total}
        >
          <span className="flex items-center text-gray-700">
            Вперёд <span className="ml-1">→</span>
          </span>
        </button>
      </div>
    </div>
  );
}
