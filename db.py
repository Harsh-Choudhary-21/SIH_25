import os
import asyncpg
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
        
        if not all([self.supabase_url, self.supabase_key]):
            raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        self._pool: Optional[asyncpg.Pool] = None
    
    async def init_pool(self):
        """Initialize database connection pool"""
        if self.database_url:
            self._pool = await asyncpg.create_pool(self.database_url)
    
    async def close_pool(self):
        """Close database connection pool"""
        if self._pool:
            await self._pool.close()
    
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
        # Create a dummy polygon (small square around 0,0)
        dummy_polygon = "POLYGON((0 0, 0.001 0, 0.001 0.001, 0 0.001, 0 0))"
        
        claim_data_with_geom = {
            **claim_data,
            "geom": f"ST_GeomFromText('{dummy_polygon}', 4326)"
        }
        
        try:
            result = self.supabase.table('claims').insert(claim_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            raise Exception(f"Failed to create claim: {str(e)}")
    
    async def get_claims(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all claims, optionally filtered by status"""
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
        try:
            result = self.supabase.table('claims').select('*').eq('id', claim_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            raise Exception(f"Failed to get claim: {str(e)}")
    
    async def get_map_data(self) -> Dict[str, Any]:
        """Get all claims as GeoJSON for map display"""
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
        try:
            result = self.supabase.table('schemes').select('*').execute()
            return result.data or []
        except Exception as e:
            raise Exception(f"Failed to get schemes: {str(e)}")
    
    async def create_scheme(self, scheme_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new scheme"""
        try:
            result = self.supabase.table('schemes').insert(scheme_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            raise Exception(f"Failed to create scheme: {str(e)}")
    
    # Recommendations operations
    async def create_recommendation(self, recommendation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new recommendation"""
        try:
            result = self.supabase.table('recommendations').insert(recommendation_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            raise Exception(f"Failed to create recommendation: {str(e)}")
    
    async def get_recommendations_for_claim(self, claim_id: int) -> List[Dict[str, Any]]:
        """Get recommendations for a specific claim"""
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