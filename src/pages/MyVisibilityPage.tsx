import React, { useEffect, useState } from 'react';
import { myVisibilityReportService, MyVisibilityReport } from '../services/myVisibilityReportService';
import { useNavigate } from 'react-router-dom';

const MyVisibilityPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<MyVisibilityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await myVisibilityReportService.getAll();
        setReports(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch my visibility reports');
      }
      setLoading(false);
    };
    fetchReports();
  }, []);

  // Get all unique keys from the data for dynamic columns
  const columns = reports.length > 0 ? Object.keys(reports[0]) : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => navigate('/feedback-reports')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          View Feedback Reports
        </button>
        <button
          onClick={() => navigate('/availability-reports')}
          className="inline-flex items-center text-green-600 hover:text-green-800 font-medium transition-colors duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          View Availability Reports
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">My Visibility Reports</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : reports.length === 0 ? (
        <div>No visibility reports found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report, idx) => (
                <tr key={report.id || idx} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="px-6 py-4 whitespace-nowrap">
                      {typeof report[col as keyof MyVisibilityReport] === 'string' && (report[col as keyof MyVisibilityReport] as string)?.startsWith('http') ? (
                        <a href={report[col as keyof MyVisibilityReport] as string} target="_blank" rel="noopener noreferrer">
                          <img src={report[col as keyof MyVisibilityReport] as string} alt={col} className="h-12 w-12 object-cover rounded" />
                        </a>
                      ) : col.toLowerCase().includes('date') || col.toLowerCase().includes('created') ? (
                        report[col as keyof MyVisibilityReport] ? new Date(report[col as keyof MyVisibilityReport] as string).toLocaleString() : 'N/A'
                      ) : (
                        report[col as keyof MyVisibilityReport] !== null && report[col as keyof MyVisibilityReport] !== undefined ? String(report[col as keyof MyVisibilityReport]) : 'N/A'
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyVisibilityPage; 