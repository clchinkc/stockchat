from sqlalchemy.orm import Session
from app.db.models import Analysis
from typing import Optional, Dict, Any
from datetime import datetime

class AnalysisRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_analysis(
        self, 
        analysis_id: str, 
        stock_data: list[Dict[str, Any]], 
        technical_metrics: Dict[str, Any],
        fundamental_metrics: Dict[str, Any],
        analysis_text: Dict[str, Any]
    ) -> Analysis:
        db_analysis = Analysis(
            id=analysis_id,
            stock_data=stock_data,
            technical_metrics=technical_metrics,
            fundamental_metrics=fundamental_metrics,
            analysis_text=analysis_text,
            timestamp=datetime.now()
        )
        self.db.add(db_analysis)
        self.db.commit()
        self.db.refresh(db_analysis)
        return db_analysis

    def get_analysis(self, analysis_id: str) -> Optional[Analysis]:
        return self.db.query(Analysis).filter(Analysis.id == analysis_id).first() 