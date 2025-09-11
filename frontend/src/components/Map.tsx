import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
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
  const [mapCenter] = useState<[number, number]>([23.5937, 78.9629]); // India center
  const [mapZoom] = useState(5);

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
      case 'approved':
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Interactive Map</h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Layers className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Forest Rights Claims</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-[600px] relative">
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
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
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No map data available</p>
                        <p className="text-sm text-gray-400">Claims will appear on the map once data is loaded</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Legend */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  Legend
                </h3>
                
                <div className="space-y-3">
                  {[
                    { status: 'approved', color: '#10B981', label: 'Approved' },
                    { status: 'pending', color: '#F59E0B', label: 'Pending' },
                    { status: 'under_review', color: '#3B82F6', label: 'Under Review' },
                    { status: 'rejected', color: '#EF4444', label: 'Rejected' },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded border-2 mr-3"
                        style={{ backgroundColor: item.color, borderColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Feature Info */}
              {selectedFeature && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Claimant</label>
                      <p className="text-sm text-gray-900 break-words" title={selectedFeature.properties.claimant_name}>
                        {selectedFeature.properties.claimant_name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-sm text-gray-900 break-words" title={`${selectedFeature.properties.village}, ${selectedFeature.properties.district}`}>
                        {selectedFeature.properties.village}, {selectedFeature.properties.district}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Area</label>
                      <p className="text-sm text-gray-900">{selectedFeature.properties.area_hectares} hectares</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedFeature.properties.status === 'approved' ? 'bg-green-100 text-green-800' :
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

              {/* Map Statistics */}
              {mapData && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Statistics</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Claims</span>
                      <span className="text-sm font-medium text-gray-900">
                        {mapData.features.length}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Area</span>
                      <span className="text-sm font-medium text-gray-900">
                        {mapData.features.reduce((sum, f) => sum + f.properties.area_hectares, 0).toFixed(1)} ha
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;