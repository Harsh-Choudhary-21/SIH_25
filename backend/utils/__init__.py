# Make utils a package and expose common processors
from .ocr import ocr_processor
from .nlp import nlp_processor
from .rules import recommendation_engine

__all__ = [
    "ocr_processor",
    "nlp_processor",
    "recommendation_engine",
]
