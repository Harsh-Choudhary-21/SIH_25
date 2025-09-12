import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, MapPin, Calendar } from 'lucide-react';
import { api } from '../utils/api';
import type { Claim } from '../types';

const Claims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    filterClaims();
  }, [claims, searchTerm, statusFilter]);

  const loadClaims = async () => {
    try {
      const claimsData = await api.getClaims();
      setClaims(claimsData);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let filtered = [...claims];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(claim => 
        claim.claimant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.village.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }

    setFilteredClaims(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Claims Management</h1>

          {/* Search and Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-lg p-6 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by claimant name or village..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-green-500 focus:border-green-500 appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="granted">Granted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Showing {filteredClaims.length} of {claims.length} claims
            </div>
          </motion.div>

          {/* Claims Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden"
          >
            {filteredClaims.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No claims found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {claims.length === 0 
                    ? 'No claims data available' 
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Claim ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Claimant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Area (Ha)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Documents
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          <div className="max-w-[120px] truncate" title={claim.id}>
                            {claim.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white max-w-[150px] truncate" title={claim.claimant_name}>
                            {claim.claimant_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium max-w-[120px] truncate" title={claim.village}>
                                {claim.village}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {claim.area?.toFixed(2) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                            {claim.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {claim.created_at ? formatDate(claim.created_at) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {claim.documents && claim.documents.length > 0 ? (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-green-500 mr-1" />
                              {claim.documents.length} file{claim.documents.length !== 1 ? 's' : ''}
                            </div>
                          ) : (
                            <span className="text-gray-400">No documents</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Claims;