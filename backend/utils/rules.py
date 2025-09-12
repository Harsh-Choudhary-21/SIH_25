from typing import Dict, Any, List, Optional
import logging
from models import ClaimResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        """Initialize the rule-based recommendation engine"""
        self.default_schemes = [
            {
                "id": 1,
                "scheme_name": "Irrigation Support Scheme",
                "description": "Support for irrigation infrastructure for larger land holdings",
                "eligibility_rules": {
                    "min_area": 2.0,
                    "max_area": None,
                    "allowed_statuses": ["granted", "pending"],
                    "priority_score": 0.8
                }
            },
            {
                "id": 2,
                "scheme_name": "Legal Aid Scheme",
                "description": "Legal assistance for pending forest rights claims",
                "eligibility_rules": {
                    "min_area": 0.1,
                    "max_area": None,
                    "allowed_statuses": ["pending"],
                    "priority_score": 0.9
                }
            },
            {
                "id": 3,
                "scheme_name": "Community Forest Rights Scheme",
                "description": "Support for small community forest rights holders",
                "eligibility_rules": {
                    "min_area": 0.1,
                    "max_area": 3.0,
                    "allowed_statuses": ["granted"],
                    "priority_score": 0.7
                }
            },
            {
                "id": 4,
                "scheme_name": "Livelihood Enhancement Scheme",
                "description": "Support for sustainable livelihood activities on forest land",
                "eligibility_rules": {
                    "min_area": 0.5,
                    "max_area": 5.0,
                    "allowed_statuses": ["granted"],
                    "priority_score": 0.6
                }
            },
            {
                "id": 5,
                "scheme_name": "Forest Conservation Scheme",
                "description": "Incentives for forest conservation activities",
                "eligibility_rules": {
                    "min_area": 1.0,
                    "max_area": None,
                    "allowed_statuses": ["granted"],
                    "priority_score": 0.75
                }
            },
            {
                "id": 6,
                "scheme_name": "Tribal Welfare Scheme",
                "description": "General welfare support for tribal communities",
                "eligibility_rules": {
                    "min_area": 0.1,
                    "max_area": None,
                    "allowed_statuses": ["granted", "pending", "rejected"],
                    "priority_score": 0.5
                }
            },
            {
                "id": 7,
                "scheme_name": "Small Farmer Support Scheme",
                "description": "Financial assistance for small-scale farming on forest land",
                "eligibility_rules": {
                    "min_area": 0.5,
                    "max_area": 2.5,
                    "allowed_statuses": ["granted"],
                    "priority_score": 0.65
                }
            },
            {
                "id": 8,
                "scheme_name": "Women Empowerment Scheme",
                "description": "Special support for women forest rights holders",
                "eligibility_rules": {
                    "min_area": 0.1,
                    "max_area": 4.0,
                    "allowed_statuses": ["granted", "pending"],
                    "priority_score": 0.7
                }
            },
            {
                "id": 9,
                "scheme_name": "Sustainable Agriculture Scheme",
                "description": "Promote eco-friendly farming practices on forest land",
                "eligibility_rules": {
                    "min_area": 1.0,
                    "max_area": 6.0,
                    "allowed_statuses": ["granted"],
                    "priority_score": 0.8
                }
            },
            {
                "id": 10,
                "scheme_name": "Forest Rights Appeal Support",
                "description": "Legal and procedural support for rejected claims",
                "eligibility_rules": {
                    "min_area": 0.1,
                    "max_area": None,
                    "allowed_statuses": ["rejected"],
                    "priority_score": 0.9
                }
            }
        ]
    
    def calculate_scheme_score(self, claim: Dict[str, Any], scheme: Dict[str, Any]) -> float:
        """Calculate dynamic compatibility score between claim and scheme"""
        try:
            rules = scheme["eligibility_rules"]
            claim_area = float(claim.get("area", 0))
            claim_status = claim.get("status", "").lower()
            claim_village = claim.get("village", "").lower()
            claim_name = claim.get("claimant_name", "").lower()
            
            # Check basic eligibility first
            if not self._meets_basic_eligibility(claim, scheme):
                return 0.0
            
            # Start with base score
            score = rules.get("priority_score", 0.5)
            
            # Dynamic area-based scoring
            min_area = rules.get("min_area", 0)
            max_area = rules.get("max_area")
            
            if min_area <= claim_area:
                # Perfect fit bonus (bell curve)
                if max_area:
                    optimal_area = (min_area + max_area) / 2
                    area_fit = 1 - abs(claim_area - optimal_area) / max(optimal_area, 1)
                    score += 0.2 * max(0, area_fit)
                else:
                    # Logarithmic scaling for unlimited schemes
                    import math
                    area_bonus = 0.15 * math.log(1 + claim_area / min_area) / math.log(10)
                    score += min(0.25, area_bonus)
            
            # Status-specific bonuses
            status_bonuses = {
                "pending": 0.1,   # Higher for pending (need support)
                "granted": 0.15,  # Highest for granted (can implement)
                "rejected": -0.05  # Small penalty but still eligible
            }
            score += status_bonuses.get(claim_status, 0)
            
            # Location-based adjustments
            if "forest" in claim_village or "jungle" in claim_village:
                if "forest" in scheme["scheme_name"].lower():
                    score += 0.1  # Forest schemes for forest areas
            
            if "village" in claim_village:
                if "community" in scheme["scheme_name"].lower():
                    score += 0.08  # Community schemes for villages
            
            # Name-based cultural matching
            if any(word in claim_name for word in ["adivasi", "tribal", "गोंड", "श्री"]):
                if "tribal" in scheme["scheme_name"].lower():
                    score += 0.12  # Tribal schemes for tribal names
            
            # Add claim-specific variation to prevent identical recommendations
            import random
            claim_id = claim.get('id', 0)
            scheme_id = scheme['id']
            random.seed(hash(f"{claim_id}{scheme_id}{claim_area}"))  # Consistent per claim-scheme pair
            variation = (random.random() - 0.5) * 0.08  # ±4% variation
            score += variation
            
            # Ensure score is between 0 and 1
            score = max(0.0, min(1.0, score))
            
            logger.info(f"Dynamic score {score:.3f} for scheme '{scheme['scheme_name']}' and claim {claim.get('id')}")
            return score
        
        except Exception as e:
            logger.error(f"Error calculating scheme score: {str(e)}")
            return 0.0
    
    def _meets_basic_eligibility(self, claim: Dict[str, Any], scheme: Dict[str, Any]) -> bool:
        """Check if claim meets basic eligibility criteria for scheme"""
        try:
            rules = scheme["eligibility_rules"]
            claim_area = float(claim.get("area", 0))
            claim_status = claim.get("status", "").lower()
            
            # Check minimum area requirement
            min_area = rules.get("min_area", 0)
            if claim_area < min_area:
                return False
            
            # Check maximum area requirement
            max_area = rules.get("max_area")
            if max_area and claim_area > max_area:
                return False
            
            # Check status eligibility
            allowed_statuses = rules.get("allowed_statuses", [])
            if allowed_statuses and claim_status not in allowed_statuses:
                return False
            
            return True
        
        except Exception as e:
            logger.error(f"Error checking basic eligibility: {str(e)}")
            return False
    
    def get_recommendations(self, claim: Dict[str, Any], schemes: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """Get scheme recommendations for a claim"""
        try:
            if schemes is None:
                schemes = self.default_schemes
            
            recommendations = []
            
            for scheme in schemes:
                score = self.calculate_scheme_score(claim, scheme)
                
                if score > 0.0:  # Only include schemes with positive scores
                    recommendation = {
                        "scheme_id": scheme["id"],
                        "scheme_name": scheme["scheme_name"],
                        "description": scheme["description"],
                        "score": score,
                        "eligibility_rules": scheme["eligibility_rules"]
                    }
                    recommendations.append(recommendation)
            
            # Sort by score (highest first)
            recommendations.sort(key=lambda x: x["score"], reverse=True)
            
            # Filter out low-scoring recommendations and limit to top 3-5
            recommendations = [r for r in recommendations if r["score"] > 0.3]
            recommendations = recommendations[:min(5, max(3, len(recommendations)))]
            
            logger.info(f"Generated {len(recommendations)} recommendations for claim {claim.get('id')}")
            return recommendations
        
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return []
    
    def get_scheme_details(self, scheme_id: int) -> Optional[Dict[str, Any]]:
        """Get details of a specific scheme"""
        for scheme in self.default_schemes:
            if scheme["id"] == scheme_id:
                return scheme
        return None
    
    def add_custom_scheme(self, scheme_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a custom scheme to the engine"""
        # Generate new ID
        max_id = max([s["id"] for s in self.default_schemes], default=0)
        scheme_data["id"] = max_id + 1
        
        # Validate required fields
        required_fields = ["scheme_name", "description", "eligibility_rules"]
        for field in required_fields:
            if field not in scheme_data:
                raise ValueError(f"Missing required field: {field}")
        
        self.default_schemes.append(scheme_data)
        logger.info(f"Added custom scheme: {scheme_data['scheme_name']}")
        return scheme_data

# Global recommendation engine instance
recommendation_engine = RecommendationEngine()