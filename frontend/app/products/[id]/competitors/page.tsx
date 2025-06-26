'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';

interface Competitor {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
}

export default function CompetitorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params); // 👈 важно: распаковываем Promise
  const id = resolvedParams.id;

  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/parser/product/${id}/competitors`)
      .then(res => res.json())
      .then(data => setCompetitors(data));
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Конкуренты товара #{id}</h1>
      <ul className="space-y-2">
        {competitors.map(c => (
          <li key={c.id} className="p-4 rounded border">
            <div><strong>{c.name}</strong></div>
            <div>Бренд: {c.brand}</div>
            <div>Цена: {c.price} ₽</div>
            <div>Рейтинг: {c.rating}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
