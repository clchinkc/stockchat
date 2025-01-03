from sqlalchemy import Column, String, JSON, DateTime
from datetime import datetime
from .database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True)
    stock_data = Column(JSON)
    technical_metrics = Column(JSON)
    fundamental_metrics = Column(JSON)
    analysis_text = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow) 