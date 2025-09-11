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
            }
        ]
    
    def calculate_scheme_score(self, claim: Dict[str, Any], scheme: Dict[str, Any]) -> float:
        """Calculate compatibility score between claim and scheme"""
        try:
            rules = scheme["eligibility_rules"]
            claim_area = float(claim.get("area", 0))
            claim_status = claim.get("status", "").lower()
            
            score = 0.0
            
            # Check basic eligibility
            if not self._meets_basic_eligibility(claim, scheme):
                return 0.0
            
            # Base score from scheme priority
            score = rules.get("priority_score", 0.5)
            
            # Area-based scoring adjustments
            min_area = rules.get("min_area", 0)
            max_area = rules.get("max_area")
            
            if claim_area >= min_area:
                # Bonus for meeting minimum area
                score += 0.1
                
                if max_area and claim_area <= max_area:
                    # Perfect fit within range
                    score += 0.1
                elif max_area is None:
                    # No upper limit, scale based on area
                    area_bonus = min(0.2, claim_area / 10.0)  # Cap at 0.2
                    score += area_bonus
            
            # Status-based adjustments
            if claim_status == "pending":
                score += 0.05  # Slight bonus for pending claims (need more support)
            elif claim_status == "granted":
                score += 0.1   # Higher bonus for granted claims (can utilize schemes)
            elif claim_status == "rejected":
                score -= 0.1   # Penalty for rejected claims
            
            # Ensure score is between 0 and 1
            score = max(0.0, min(1.0, score))
            
            logger.info(f"Calculated score {score:.3f} for scheme '{scheme['scheme_name']}' and claim {claim.get('id')}")
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
            
            # Limit to top 5 recommendations
            recommendations = recommendations[:5]
            
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