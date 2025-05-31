import React, { useState, useEffect } from 'react';
import RequestsTable from '../components/Requests/RequestsTable';
import { RequestData, requestService } from '../services/requestService';
import { useAuth } from '../contexts/AuthContext';

const PendingRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchRequests = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch requests with myStatus = 1 (pending)
      const data = await requestService.getRequests({ myStatus: 1 });
      // Filter requests to only show those belonging to the current user
      const userRequests = data.filter(request => request.userId === user.id);
      setRequests(userRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]); // Re-fetch when user ID changes

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              My Pending Requests
            </h3>
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <RequestsTable requests={requests} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingRequestsPage; 