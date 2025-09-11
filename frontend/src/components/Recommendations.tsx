import React, { useState, useEffect } from 'react';
import { Search, Lightbulb, IndianRupee, Clock, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../utils/api';
import type { Claim, Recommendation } from '../types';

const Recommendations: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const claimsData = await api.getClaims();
      setClaims(claimsData);
      if (claimsData.length > 0) {
        setSelectedClaimId(claimsData[0].id);
      }
    } catch (error) {
      console.error('Error loading claims:', error);
    }
  };

  const loadRecommendations = async (claimId: string) => {
    if (!claimId) return;
    
    setLoading(true);
    try {
      const recommendationsData = await api.getRecommendations(claimId);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      // Create sample recommendations if API fails
      setRecommendations([
        {
          id: '1',
          claim_id: claimId,
          scheme_name: 'Forest Rights Act Implementation Support',
          scheme_description: 'Financial assistance for forest dwellers to implement sustainable forest management practices and improve livelihood opportunities.',
          eligibility_criteria: [
            'Holds valid forest rights certificate',
            'Area must be less than 4 hectares',
            'Must be engaged in traditional forest practices',
            'No pending legal disputes'
          ],
          potential_benefits: 'Up to ₹2,00,000 for sustainable forest management activities, skill development programs, and infrastructure development.',
          implementation_steps: [
            'Submit application with forest rights certificate',
            'Community verification and approval',
            'Technical assessment by forest department',
            'Funding approval and disbursement',
            'Implementation monitoring'
          ],
          estimated_cost: 200000,
          timeline: '6-8 months',
          confidence_score: 0.85
        },
        {
          id: '2',
          claim_id: claimId,
          scheme_name: 'Tribal Livelihood Enhancement Program',
          scheme_description: 'Support program for tribal communities to develop alternative livelihood opportunities while preserving traditional practices.',
          eligibility_criteria: [
            'Belongs to scheduled tribe community',
            'Holds forest rights',
            'Annual income below ₹2,50,000',
            'Willing to participate in training programs'
          ],
          potential_benefits: 'Training, equipment, and market linkages for traditional crafts, minor forest produce collection, and eco-tourism activities.',
          implementation_steps: [
            'Skill assessment and training needs analysis',
            'Enrollment in appropriate training programs',
            'Equipment and infrastructure support',
            'Market linkage development',
            'Ongoing mentorship and support'
          ],
          estimated_cost: 150000,
          timeline: '4-6 months',
          confidence_score: 0.78
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClaimId) {
      loadRecommendations(selectedClaimId);
    }
  }, [selectedClaimId]);

  const selectedClaim = claims.find(claim => claim.id === selectedClaimId);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Recommendations</h1>

          {/* Claim Selection */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Claim for Recommendations</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Claim
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    value={selectedClaimId}
                    onChange={(e) => setSelectedClaimId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select a claim...</option>
                    {claims.map((claim) => (
                      <option key={claim.id} value={claim.id}>
                        {claim.claimant_name} - {claim.village}, {claim.district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedClaim && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Claim Details</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Claimant:</span> {selectedClaim.claimant_name}</p>
                    <p><span className="font-medium">Location:</span> {selectedClaim.village}, {selectedClaim.district}</p>
                    <p><span className="font-medium">Area:</span> {selectedClaim.area_hectares} hectares</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        selectedClaim.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedClaim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedClaim.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {loading ? (
            <div className="bg-white shadow rounded-lg p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating AI recommendations...</p>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No recommendations available</p>
                <p className="text-sm text-gray-400">
                  {selectedClaimId ? 'No suitable schemes found for this claim' : 'Please select a claim to view recommendations'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCard(recommendation.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            <span className="break-words" title={recommendation.scheme_name}>
                              {recommendation.scheme_name}
                            </span>
                          </h3>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Target className={`h-4 w-4 mr-1 ${getConfidenceColor(recommendation.confidence_score)}`} />
                              <span className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence_score)}`}>
                                {Math.round(recommendation.confidence_score * 100)}% match
                              </span>
                            </div>
                            {expandedCard === recommendation.id ? 
                              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            }
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 break-words" title={recommendation.scheme_description}>
                          {recommendation.scheme_description}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            <span>{formatCurrency(recommendation.estimated_cost)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{recommendation.timeline}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {expandedCard === recommendation.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Eligibility Criteria</h4>
                            <ul className="space-y-2">
                              {recommendation.eligibility_criteria.map((criteria, index) => (
                                <li key={index} className="flex items-start">
                                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-sm text-gray-600 break-words" title={criteria}>
                                    {criteria}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Implementation Steps</h4>
                            <ol className="space-y-2">
                              {recommendation.implementation_steps.map((step, index) => (
                                <li key={index} className="flex items-start">
                                  <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 flex-shrink-0 mt-0.5">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm text-gray-600 break-words" title={step}>
                                    {step}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <h4 className="font-medium text-gray-900 mb-2">Potential Benefits</h4>
                          <p className="text-sm text-gray-600 break-words" title={recommendation.potential_benefits}>
                            {recommendation.potential_benefits}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;