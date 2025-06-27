'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';

interface Color {
  id: number;
  name: string;
}

interface Product {
  id: number;
  nmId: number;
  name: string;
  brand: string;
  image: string | null;
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
  isDeleted: boolean;
  parsedAt: string;
}

interface CompetitorsResponse {
  ourProduct: Product;
  competitors: Product[];
}

const ProductTable = ({ 
  product, 
  isOurProduct = false,
  onDelete
}: { 
  product: Product; 
  isOurProduct?: boolean;
  onDelete?: () => void;
}) => (
  <tr className={isOurProduct ? "bg-blue-50" : "transition even:bg-gray-50 hover:bg-gray-100"}>
    <td className="p-2 text-center border">
      <img
        width={200}
        height={200}
        style={{ objectFit: 'contain' }}
        src={product.image || '/placeholder.png'}
        alt={product.name}
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
    </td>
    <td className="p-2 border">{product.name}</td>
    <td className="p-2 border">{product.brand}</td>
    <td className="p-2 text-center border">{product.price} ₽</td>
    <td className="p-2 text-center border">{product.rating}</td>
    <td className="p-2 text-center border">{product.feedbacks}</td>
    <td className="p-2 text-center border">{product.totalQuantity}</td>
    <td className="p-2 border">{product.colors.map(c => c.name).join(', ')}</td>
    {!isOurProduct && onDelete && (
      <td className="p-2 border">
        <button
          onClick={onDelete}
          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
        >
          Удалить похожее
        </button>
      </td>
    )}
  </tr>
);

export default function CompetitorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<CompetitorsResponse | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/parser/product/${resolvedParams.id}/competitors`)
      .then(res => res.json())
      .then(data => {
        setData(data);
      });
  }, [resolvedParams.id]);

  const handleDeleteCompetitor = async (competitorNmId: number) => {
    if (!data) return;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/parser/product/${data.ourProduct.nmId}/remove-competitors`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ competitorNmIds: [competitorNmId] }),
      });

      setData(prev => prev ? {
        ...prev,
        competitors: prev.competitors.filter(c => c.nmId !== competitorNmId)
      } : null);
    } catch (error) {
      console.error('Failed to delete competitor:', error);
      alert('Не удалось удалить конкурента');
    }
  };

  const handleDeleteAllCompetitors = async () => {
    if (!data?.competitors.length) return;

    try {
      const competitorNmIds = data.competitors.map(c => c.nmId);

      await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/parser/product/${data.ourProduct.nmId}/remove-competitors`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ competitorNmIds }),
      });

      setData(prev => prev ? {
        ...prev,
        competitors: []
      } : null);
    } catch (error) {
      console.error('Failed to delete all competitors:', error);
      alert('Не удалось удалить конкурентов');
    }
  };

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Конкуренты товара #{data.ourProduct.nmId}</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Наш товар</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Изображение</th>
              <th className="p-2 border">Артикул</th>
              <th className="p-2 border">Название</th>
              <th className="p-2 border">Бренд</th>
              <th className="p-2 border">Цена</th>
              <th className="p-2 border">Рейтинг</th>
              <th className="p-2 border">Отзывы</th>
              <th className="p-2 border">Количество</th>
              <th className="p-2 border">Цвета</th>
            </tr>
          </thead>
          <tbody>
            <ProductTable product={data.ourProduct} isOurProduct={true} />
          </tbody>
        </table>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Похожие</h2>
          {data.competitors.length > 0 && (
            <button
              onClick={handleDeleteAllCompetitors}
              className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
            >
              Удалить все похожие
            </button>
          )}
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Изображение</th>
              <th className="p-2 border">Артикул</th>
              <th className="p-2 border">Название</th>
              <th className="p-2 border">Бренд</th>
              <th className="p-2 border">Цена</th>
              <th className="p-2 border">Рейтинг</th>
              <th className="p-2 border">Отзывы</th>
              <th className="p-2 border">Количество</th>
              <th className="p-2 border">Цвета</th>
              <th className="p-2 border">Действия</th>
            </tr>
          </thead>
          <tbody>
            {data.competitors.map(product => (
              <ProductTable 
                key={product.id} 
                product={product} 
                onDelete={() => handleDeleteCompetitor(product.nmId)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
