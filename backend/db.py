import os
import asyncpg
import ssl
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
import json
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        self.database_url = os.getenv("DATABASE_URL")
        
        # Initialize Supabase client if credentials are available; otherwise fall back to demo mode
        self.supabase = None
        self.demo_mode = False
        if self.supabase_url and self.supabase_key:
            try:
                self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
            except Exception as e:
                print("⚠️  Supabase client initialization failed, falling back to DEMO MODE")
                print(f"   Reason: {e}")
                self.demo_mode = True
        else:
            self.demo_mode = True
        
        if self.demo_mode:
            print("⚠️  Running in DEMO MODE")
            print("   Using mock data for demonstration purposes")
            print("   Set SUPABASE_URL and SUPABASE_KEY for production use")
            self.supabase = None
            self._demo_claims = self._get_demo_claims()  # Store demo claims in memory
            self._demo_schemes = self._get_demo_schemes()
            self._demo_recommendations = []
        
        self._pool: Optional[asyncpg.Pool] = None
    
    def _get_demo_claims(self) -> List[Dict[str, Any]]:
        """Get demo claims for demo mode"""
        from datetime import datetime
        return [
            {
                "id": 1,
                "claimant_name": "Ramesh Kumar",
                "village": "Bandhavgarh",
                "area": 2.5,
                "status": "granted",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "id": 2,
                "claimant_name": "Sunita Devi",
                "village": "Kanha",
                "area": 1.2,
                "status": "pending",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "id": 3,
                "claimant_name": "Mohan Singh",
                "village": "Pench",
                "area": 0.8,
                "status": "rejected",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
        ]
    
    def _get_demo_schemes(self) -> List[Dict[str, Any]]:
        """Get demo schemes for demo mode"""
        from datetime import datetime
        return [
            {
                "id": 1,
                "scheme_name": "Irrigation Support Scheme",
                "description": "Support for irrigation infrastructure for larger land holdings",
                "eligibility_rules": {"min_area": 2.0, "max_area": None, "allowed_statuses": ["granted", "pending"]},
                "created_at": datetime.now()
            },
            {
                "id": 2,
                "scheme_name": "Legal Aid Scheme",
                "description": "Legal assistance for pending forest rights claims",
                "eligibility_rules": {"min_area": 0.1, "max_area": None, "allowed_statuses": ["pending"]},
                "created_at": datetime.now()
            },
            {
                "id": 3,
                "scheme_name": "Community Forest Rights Scheme",
                "description": "Support for small community forest rights holders",
                "eligibility_rules": {"min_area": 0.1, "max_area": 3.0, "allowed_statuses": ["granted"]},
                "created_at": datetime.now()
            }
        ]
    
    async def init_pool(self):
        """Initialize database connection pool"""
        if self.database_url and self._pool is None and not self.demo_mode:
            try:
                # Supabase Postgres requires SSL; use a default SSL context
                self._pool = await asyncpg.create_pool(self.database_url, ssl=True, min_size=1, max_size=5)
            except Exception as e:
                print(f"⚠️  Database connection failed, switching to DEMO MODE: {str(e)}")
                self.demo_mode = True
                self.supabase = None
                self._demo_claims = []
                self._demo_schemes = self._get_demo_schemes()
                self._demo_recommendations = []
    
    async def close_pool(self):
        """Close database connection pool"""
        if self._pool:
            await self._pool.close()
            self._pool = None
    
    async def get_connection(self):
        """Get database connection from pool"""
        if not self._pool:
            await self.init_pool()
        return await self._pool.acquire()
    
    async def release_connection(self, connection):
        """Release database connection back to pool"""
        if self._pool:
            await self._pool.release(connection)
    
    # Claims operations
    async def create_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new claim with dummy polygon"""
        if self.demo_mode:
            # Demo mode: store in memory
            from datetime import datetime
            claim_id = len(self._demo_claims) + 1
            new_claim = {
                "id": claim_id,
                **claim_data,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            self._demo_claims.append(new_claim)
            return new_claim
        else:
            # Production mode: use Supabase with default geometry
            try:
                # Add default geometry (small polygon around origin)
                claim_data_with_geom = {
                    **claim_data,
                    "geom": "POLYGON((0 0, 0.001 0, 0.001 0.001, 0 0.001, 0 0))"
                }
                result = self.supabase.table('claims').insert(claim_data_with_geom).execute()
                return result.data[0] if result.data else None
            except Exception as e:
                raise Exception(f"Failed to create claim: {str(e)}")
    
    async def get_claims(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all claims, optionally filtered by status"""
        if self.demo_mode:
            # Demo mode: filter from memory
            claims = self._demo_claims
            if status:
                claims = [c for c in claims if c.get('status') == status]
            return claims
        else:
            # Production mode: use Supabase
            try:
                query = self.supabase.table('claims').select('*')
                if status:
                    query = query.eq('status', status)
                
                result = query.execute()
                return result.data or []
            except Exception as e:
                raise Exception(f"Failed to get claims: {str(e)}")
    
    async def get_claim_by_id(self, claim_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific claim by ID"""
        if self.demo_mode:
            # Demo mode: find in memory
            for claim in self._demo_claims:
                if claim['id'] == claim_id:
                    return claim
            return None
        else:
            # Production mode: use Supabase
            try:
                result = self.supabase.table('claims').select('*').eq('id', claim_id).execute()
                return result.data[0] if result.data else None
            except Exception as e:
                raise Exception(f"Failed to get claim: {str(e)}")
    
    async def get_map_data(self) -> Dict[str, Any]:
        """Get all claims as GeoJSON for map display"""
        if self.demo_mode:
            # Demo mode: create GeoJSON from demo claims
            features = []
            for claim in self._demo_claims:
                # Create a dummy polygon for demo purposes
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[0, 0], [0.001, 0], [0.001, 0.001], [0, 0.001], [0, 0]]]
                    },
                    "properties": {
                        "id": claim["id"],
                        "claimant_name": claim["claimant_name"],
                        "village": claim["village"],
                        "area": claim["area"],
                        "status": claim["status"]
                    }
                }
                features.append(feature)
            
            return {
                "type": "FeatureCollection",
                "features": features
            }
        else:
            # Production mode: use PostGIS query
            if not self._pool:
                await self.init_pool()
            
            connection = await self.get_connection()
            try:
                query = """
                SELECT jsonb_build_object(
                    'type', 'FeatureCollection',
                    'features', jsonb_agg(
                        jsonb_build_object(
                            'type', 'Feature',
                            'geometry', st_asgeojson(geom)::jsonb,
                            'properties', jsonb_build_object(
                                'id', id,
                                'claimant_name', claimant_name,
                                'village', village,
                                'area', area,
                                'status', status
                            )
                        )
                    )
                ) as geojson
                FROM claims;
                """
                
                result = await connection.fetchval(query)
                return result or {"type": "FeatureCollection", "features": []}
            except Exception as e:
                raise Exception(f"Failed to get map data: {str(e)}")
            finally:
                await self.release_connection(connection)
    
    # Schemes operations
    async def get_schemes(self) -> List[Dict[str, Any]]:
        """Get all schemes"""
        if self.demo_mode:
            return self._demo_schemes
        else:
            try:
                result = self.supabase.table('schemes').select('*').execute()
                return result.data or []
            except Exception as e:
                raise Exception(f"Failed to get schemes: {str(e)}")
    
    async def create_scheme(self, scheme_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new scheme"""
        if self.demo_mode:
            from datetime import datetime
            scheme_id = len(self._demo_schemes) + 1
            new_scheme = {
                "id": scheme_id,
                **scheme_data,
                "created_at": datetime.now()
            }
            self._demo_schemes.append(new_scheme)
            return new_scheme
        else:
            try:
                result = self.supabase.table('schemes').insert(scheme_data).execute()
                return result.data[0] if result.data else None
            except Exception as e:
                raise Exception(f"Failed to create scheme: {str(e)}")
    
    # Recommendations operations
    async def create_recommendation(self, recommendation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new recommendation"""
        if self.demo_mode:
            from datetime import datetime
            rec_id = len(self._demo_recommendations) + 1
            new_rec = {
                "id": rec_id,
                **recommendation_data,
                "created_at": datetime.now()
            }
            self._demo_recommendations.append(new_rec)
            return new_rec
        else:
            try:
                result = self.supabase.table('recommendations').insert(recommendation_data).execute()
                return result.data[0] if result.data else None
            except Exception as e:
                raise Exception(f"Failed to create recommendation: {str(e)}")
    
    async def get_recommendations_for_claim(self, claim_id: int) -> List[Dict[str, Any]]:
        """Get recommendations for a specific claim"""
        if self.demo_mode:
            # Demo mode: filter recommendations and add scheme info
            recommendations = []
            for rec in self._demo_recommendations:
                if rec.get('claim_id') == claim_id:
                    # Find scheme info
                    scheme_info = None
                    for scheme in self._demo_schemes:
                        if scheme['id'] == rec.get('scheme_id'):
                            scheme_info = scheme
                            break
                    
                    rec_with_scheme = {
                        **rec,
                        "schemes": scheme_info
                    }
                    recommendations.append(rec_with_scheme)
            return recommendations
        else:
            try:
                result = (self.supabase.table('recommendations')
                         .select('*, schemes(*)')
                         .eq('claim_id', claim_id)
                         .execute())
                return result.data or []
            except Exception as e:
                raise Exception(f"Failed to get recommendations: {str(e)}")

# Global database instance
db = Database()