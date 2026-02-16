'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';

interface RatingsPieProps {
  data: Array<{ specialtyId: string; specialty: string; average: number; totalReviews: number }>;
}

const COLORS = ['#0ea5e9', '#14b8a6', '#84cc16', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RatingsPie({ data }: RatingsPieProps) {
  const t = useTranslations('adminDashboard');
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{t('charts.ratingsTitle')}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="average"
              nameKey="specialty"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {data.map((item, index) => (
                <Cell key={item.specialtyId} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
