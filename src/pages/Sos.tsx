import React, { useState, useEffect } from 'react';
import { SosData } from '../services/sosService';
import sosService from '../services/sosService';
import { useAuth } from '../contexts/AuthContext';
import StatCards from '../components/Dashboard/StatCards';

const SosPage: React.FC = () => {
  const [sosList, setSosList] = useState<SosData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSosList = async () => {
    console.log('Fetching SOS list...');
    try {
      setIsLoading(true);
      const data = await sosService.getSosList();
      console.log('Received SOS data:', data);
      
      if (!data) {
        console.log('No data received from API');
        setSosList([]);
        return;
      }

      // Ensure data is an array
      const sosArray = Array.isArray(data) ? data : [];
      console.log('Processed SOS array:', sosArray);
      setSosList(sosArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching SOS list:', err);
      setError('Failed to load SOS data. Please try again later.');
      setSosList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('SOS component mounted, user:', user);
    fetchSosList();
  }, []); // Remove user?.id dependency to fetch regardless of user state

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading SOS data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  // Ensure sosList is an array before mapping
  const displayList = Array.isArray(sosList) ? sosList : [];
  console.log('Display list:', displayList);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
         
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              SOS Alerts
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distress Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No SOS alerts found
                    </td>
                  </tr>
                ) : (
                  displayList.map((sos) => (
                    <tr key={sos.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sos.userName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sos.userPhone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sos.distressType || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sos.address || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sos.latitude && sos.longitude 
                            ? `${sos.latitude.toFixed(6)}, ${sos.longitude.toFixed(6)}`
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sos.status)}`}>
                          {sos.status ? sos.status.charAt(0).toUpperCase() + sos.status.slice(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sos.createdAt ? new Date(sos.createdAt).toLocaleString() : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SosPage;