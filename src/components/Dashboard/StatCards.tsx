import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from './StatCard';
import { requests } from '../../utils/demoData';
import { TrendingUpIcon, BookCheck, LayoutList, BadgeCheck } from 'lucide-react';
const StatCards: React.FC = () => {
  const navigate = useNavigate();
  return <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div onClick={() => navigate('/dashboard/clients')} className="cursor-pointer">
        <StatCard position={1} title="Unscheduled" value={requests.unscheduled} icon={<BookCheck className="h-6 w-6 text-red-600" aria-hidden="true" />} change={{
        value: 5.3,
        positive: true
      }} />
      </div>
      <div onClick={() => navigate('/dashboard/pending')} className="cursor-pointer">
        <StatCard position={2} title="Pending" value={requests.pending} icon={<LayoutList className="h-6 w-6 text-red-600" aria-hidden="true" />} change={{
        value: 2.1,
        positive: true
      }} />
      </div>
      <div onClick={() => navigate('/dashboard/in-transit')} className="cursor-pointer">
        <StatCard position={3} title="In Transit" value={(requests.inTransit / 1000).toFixed(1)} suffix="k" icon={<TrendingUpIcon className="h-6 w-6 text-red-600" aria-hidden="true" />} change={{
        value: 1.8,
        positive: true
      }} />
      </div>
      <div onClick={() => navigate('/dashboard/claims')} className="cursor-pointer">
        <StatCard position={4} title="Completed" value={requests.completed.toFixed(2)} icon={<BadgeCheck className="h-6 w-6 text-red-600" aria-hidden="true" />} change={{
        value: 0.5,
        positive: false
      }} />
      </div>
    </div>;
};
export default StatCards;