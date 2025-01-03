from pydantic import BaseModel

class StockAnalysisRequest(BaseModel):
    message: str

class StockAnalysisResponse(BaseModel):
    stockData: list
    analysisText: dict
    shareId: str 