import React, { useState, useEffect } from 'react';
import { FileText, Users, MapPin, TrendingUp, Upload } from 'lucide-react';
import FileUpload from './FileUpload';
import { api } from '../utils/api';
import type { Claim } from '../types';

const Dashboard: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    totalArea: 0,
  });

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const claimsData = await api.getClaims();
      setClaims(claimsData);
      
      const totalClaims = claimsData.length;
      const pendingClaims = claimsData.filter((c: Claim) => c.status === 'pending').length;
      const approvedClaims = claimsData.filter((c: Claim) => c.status === 'approved').length;
      const totalArea = claimsData.reduce((sum: number, c: Claim) => sum + c.area_hectares, 0);
      
      setStats({ totalClaims, pendingClaims, approvedClaims, totalArea });
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (response: any) => {
    console.log('Upload successful:', response);
    // Refresh claims data after successful upload
    loadClaims();
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const statCards = [
    {
      title: 'Total Claims',
      value: stats.totalClaims,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Pending Review',
      value: stats.pendingClaims,
      icon: Users,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Approved Claims',
      value: stats.approvedClaims,
      icon: MapPin,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Area (Ha)',
      value: stats.totalArea.toFixed(1),
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${stat.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.title}
                        </dt>
                        <dd className={`text-lg font-medium ${stat.textColor}`}>
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* File Upload Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-green-600" />
                Document Upload
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Upload forest rights claim documents, surveys, or related materials
              </p>
            </div>
            
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>

          {/* Recent Claims */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Claims</h2>
            
            {claims.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No claims data available</p>
                <p className="text-sm text-gray-400">Claims will appear here once data is loaded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Claimant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area (Ha)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.slice(0, 5).map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="max-w-[150px] truncate" title={claim.claimant_name}>
                            {claim.claimant_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="max-w-[120px] truncate" title={`${claim.village}, ${claim.district}`}>
                            {claim.village}, {claim.district}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.area_hectares}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                            claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            claim.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {claim.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;