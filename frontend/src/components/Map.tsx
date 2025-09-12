import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { MapPin, Layers, Info } from 'lucide-react';
import { api } from '../utils/api';
import type { GeoJSONData, GeoJSONFeature } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractiveMap: React.FC = () => {
  const [mapData, setMapData] = useState<GeoJSONData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(6);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const data = await api.getMapData();
      setMapData(data);
    } catch (error) {
      console.error('Error loading map data:', error);
      // Create sample data if API fails
      setMapData({
        type: 'FeatureCollection',
        features: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeatureStyle = (feature: GeoJSONFeature) => {
    const status = feature.properties.status;
    let color = '#6B7280'; // default gray
    
    switch (status) {
      case 'granted':
        color = '#10B981'; // green
        break;
      case 'pending':
        color = '#F59E0B'; // yellow
        break;
      case 'under_review':
        color = '#3B82F6'; // blue
        break;
      case 'rejected':
        color = '#EF4444'; // red
        break;
    }
    
    return {
      color: color,
      weight: 2,
      opacity: 0.8,
      fillColor: color,
      fillOpacity: 0.3,
    };
  };

  const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
    layer.on({
      click: () => {
        setSelectedFeature(feature);
      },
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          fillOpacity: 0.5,
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(getFeatureStyle(feature));
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pl-20"
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interactive Map</h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Layers className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Forest Rights Claims</span>
              </div>
              
              {/* Quick Zoom Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setMapCenter([20.0937, 80.2707]);
                    setMapZoom(9);
                    if (mapRef.current) {
                      mapRef.current.setView([20.0937, 80.2707], 9);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                >
                  Madhya Pradesh
                </button>
                <button
                  onClick={() => {
                    setMapCenter([17.3753, 83.3932]);
                    setMapZoom(9);
                    if (mapRef.current) {
                      mapRef.current.setView([17.3753, 83.3932], 9);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                >
                  Andhra Pradesh
                </button>
                <button
                  onClick={() => {
                    setMapCenter([12.1568, 76.4951]);
                    setMapZoom(9);
                    if (mapRef.current) {
                      mapRef.current.setView([12.1568, 76.4951], 9);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
                >
                  Karnataka
                </button>
                <button
                  onClick={() => {
                    setMapCenter([23.5937, 78.9629]);
                    setMapZoom(6);
                    if (mapRef.current) {
                      mapRef.current.setView([23.5937, 78.9629], 6);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  All India
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
            <div className="lg:col-span-3">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden"
              >
                <div className="h-[600px] relative z-0">
                  <MapContainer
                    ref={mapRef}
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                    className="rounded-lg"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {mapData && mapData.features.length > 0 && (
                      <GeoJSON
                        data={mapData}
                        style={getFeatureStyle}
                        onEachFeature={onEachFeature}
                      />
                    )}
                  </MapContainer>
                  
                  {mapData && mapData.features.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-90">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No map data available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Claims will appear on the map once data is loaded</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Legend */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  Legend
                </h3>
                
                <div className="space-y-3">
                  {[
                    { status: 'granted', color: '#10B981', label: 'Granted' },
                    { status: 'pending', color: '#F59E0B', label: 'Pending' },
                    { status: 'under_review', color: '#3B82F6', label: 'Under Review' },
                    { status: 'rejected', color: '#EF4444', label: 'Rejected' },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded border-2 mr-3"
                        style={{ backgroundColor: item.color, borderColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Selected Feature Info */}
              {selectedFeature && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Claim Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Claimant</label>
                      <p className="text-sm text-gray-900 dark:text-white break-words" title={selectedFeature.properties.claimant_name}>
                        {selectedFeature.properties.claimant_name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                      <p className="text-sm text-gray-900 dark:text-white break-words" title={`${selectedFeature.properties.village}, ${selectedFeature.properties.district}`}>
                        {selectedFeature.properties.village}, {selectedFeature.properties.district}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Area</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedFeature.properties.area_hectares} hectares</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedFeature.properties.status === 'granted' ? 'bg-green-100 text-green-800' :
                          selectedFeature.properties.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedFeature.properties.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedFeature.properties.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Claimed Areas List */}
              {mapData && mapData.features.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Claimed Areas</h3>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {mapData.features.map((feature) => (
                      <div
                        key={feature.properties.id}
                        onClick={() => {
                          // Get center of polygon
                          const coords = feature.geometry.coordinates[0];
                          const lats = coords.map(c => c[1]);
                          const lngs = coords.map(c => c[0]);
                          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
                          const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
                          
                          setMapCenter([centerLat, centerLng]);
                          setMapZoom(12);
                          if (mapRef.current) {
                            mapRef.current.setView([centerLat, centerLng], 12);
                          }
                          setSelectedFeature(feature);
                        }}
                        className="p-3 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {feature.properties.claimant_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {feature.properties.village}, {feature.properties.district}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              feature.properties.status === 'granted' ? 'bg-green-100 text-green-800' :
                              feature.properties.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {feature.properties.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {feature.properties.area_hectares} ha
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Statistics */}
              {mapData && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Map Statistics</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Claims</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {mapData.features.length}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Area</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {mapData.features.reduce((sum, f) => sum + (f.properties.area_hectares || 0), 0).toFixed(1)} ha
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveMap;