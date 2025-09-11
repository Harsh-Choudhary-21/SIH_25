export interface Claim {
  id: number;
  claimant_name: string;
  village: string;
  area: number;
  status: 'pending' | 'granted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    id: string;
    claimant_name: string;
    status: string;
    area_hectares: number;
    village: string;
    district: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface Recommendation {
  id: string;
  claim_id: string;
  scheme_name: string;
  scheme_description: string;
  eligibility_criteria: string[];
  potential_benefits: string;
  implementation_steps: string[];
  estimated_cost: number;
  timeline: string;
  confidence_score: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file_id?: string;
  filename?: string;
}