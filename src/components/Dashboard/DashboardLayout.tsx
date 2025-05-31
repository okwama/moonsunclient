import React from 'react';
import { Outlet } from 'react-router-dom';
import StatCards from './StatCards';

const DashboardLayout: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">
          Dashboard Overview
        </h3>
      </div>
      <StatCards />
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;