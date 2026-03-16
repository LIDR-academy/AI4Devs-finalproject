from sqlalchemy.orm import Session
from models.contributor import Contributor
from models.classification import Classification
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
from datetime import datetime

class ClassificationService:
    def __init__(self, db: Session):
        self.db = db
        self.model = RandomForestClassifier()

    def get_contributor_features(self, contributor_id: int) -> dict:
        """Obtiene las características relevantes del contribuyente para su clasificación"""
        # Implementar lógica para extraer características
        pass

    def classify_contributor(self, contributor_id: int) -> Classification:
        """Clasifica a un contribuyente según su probabilidad de pago"""
        features = self.get_contributor_features(contributor_id)

        """prediction = self.model.predict([list(features.values())])"""
        score = 0; """self.model.predict_proba([list(features.values())])[0].max()"""
        """ obtenemos el nivel de clasificacion con base al mapeo self._map_prediction_to_level(prediction[0]),"""

        classification = Classification(
            contribuyente_id=contributor_id,
            nivel_probabilidad="MEDIO", 
            score=float(score),
            fecha_clasificacion=datetime.now(),
            estado="ACTIVO"
        )
        
        self.db.add(classification)
        self.db.commit()
        self.db.refresh(classification)
        
        return classification

    def _map_prediction_to_level(self, prediction: int) -> str:
        """Mapea la predicción numérica a un nivel de probabilidad"""
        mapping = {0: "BAJO", 1: "MEDIO", 2: "ALTO"}
        return mapping.get(prediction, "MEDIO") 