from datetime import datetime
import yfinance as yf
import pandas as pd
from typing import Tuple, List, Dict, Any
import numpy as np
import time
import logging
from .dspy_service import DspyService

logger = logging.getLogger(__name__)

class StockService:
    _dspy_service = DspyService()

    @staticmethod
    def get_stock_data(query: str = "Show me Apple stock") -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        # Extract stock info using DSPy
        extracted_info = StockService._dspy_service.extract_stock_info(query)
        
        try:
            # Create ticker instance with extracted symbol
            ticker = yf.Ticker(extracted_info.symbol)
            
            # Get historical data with extracted yfinance parameters
            df = ticker.history(
                period=extracted_info.yfinance_period,
                interval=extracted_info.yfinance_interval
            )
                
            # Calculate technical indicators
            df['Returns'] = df['Close'].pct_change()
            df['MA20'] = df['Close'].rolling(window=20, min_periods=0).mean()
            df['MA50'] = df['Close'].rolling(window=50, min_periods=0).mean()
            df['MA200'] = df['Close'].rolling(window=200, min_periods=0).mean()
            
            # Calculate summary statistics
            latest_data = df.iloc[-1]
            prev_day_data = df.iloc[-2]
            
            # Get fundamental data with retry logic
            try:
                info = ticker.info
                logger.info(f"Ticker info: {info}")
            except Exception as e:
                logger.warning(f"Failed to get ticker info: {str(e)}")
                info = {}

            # Combine technical and fundamental metrics
            stats = {
                'technical': {
                    'current_price': round(latest_data['Close'], 2),
                    'daily_change': round(latest_data['Close'] - prev_day_data['Close'], 2),
                    'daily_return': round((latest_data['Close'] / prev_day_data['Close'] - 1) * 100, 2),
                    'yearly_change': round(latest_data['Close'] - df['Close'].iloc[0], 2),
                    'yearly_return': round((latest_data['Close'] / df['Close'].iloc[0] - 1) * 100, 2),
                    'daily_volume': int(latest_data['Volume']),
                    'avg_daily_volume': int(df['Volume'].mean()),
                    'yearly_high': round(df['High'].max(), 2),
                    'yearly_low': round(df['Low'].min(), 2),
                    'daily_volatility': round(df['Returns'].std() * 100, 2),
                    'avg_daily_return': round(df['Returns'].mean() * 100, 2),
                    'annualized_volatility': round(df['Returns'].std() * np.sqrt(252) * 100, 2),
                    'ticker': extracted_info.symbol,  # Use extracted symbol
                },
                'fundamental': {
                    'marketCap': info.get('marketCap', None),
                    'sector': info.get('sector', 'N/A'),
                    'industry': info.get('industry', 'N/A'),
                    'trailingPE': info.get('trailingPE', None),
                    'forwardPE': info.get('forwardPE', None),
                    'priceToBook': info.get('priceToBook', None),
                    'beta': info.get('beta', None),
                    'dividendYield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else None,
                    'trailingEps': info.get('trailingEps', None),
                    'forwardEps': info.get('forwardEps', None),
                    'profitMargins': info.get('profitMargins', 0) * 100 if info.get('profitMargins') else None,
                    'operatingMargins': info.get('operatingMargins', 0) * 100 if info.get('operatingMargins') else None
                }
            }
            
            # Determine trend based on moving averages
            is_bullish = (latest_data['MA50'] > latest_data['MA200'])
            trend_strength = abs(latest_data['MA50'] - latest_data['MA200']) / latest_data['MA200'] * 100

            stats['technical'].update({
                'trend': "bullish" if is_bullish else "bearish",
                'trend_strength': round(trend_strength, 2),
            })
            
            # Format price data
            price_data = []
            for date, row in df.iterrows():
                price_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "price": round(float(row['Close']), 2),
                    "open": round(float(row['Open']), 2),
                    "high": round(float(row['High']), 2),
                    "low": round(float(row['Low']), 2),
                    "volume": int(row['Volume']),
                    "returns": round(float(row['Returns'] * 100) if not pd.isna(row['Returns']) else 0, 2),
                    "ma20": round(float(row['MA20']) if not pd.isna(row['MA20']) else row['Close'], 2),
                    "ma50": round(float(row['MA50']) if not pd.isna(row['MA50']) else row['Close'], 2),
                    "ma200": round(float(row['MA200']) if not pd.isna(row['MA200']) else row['Close'], 2),
                })
            
            return price_data, stats

        except Exception as e:
            logger.exception(f"Error fetching stock data: {str(e)}")
            raise

    @staticmethod
    def generate_analysis_text(stats: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Generate analysis using DSPy
            analysis = StockService._dspy_service.generate_analysis(stats)
        
            return {
                "summary": analysis.summary,
                "technicalFactors": analysis.technical_factors,
                "fundamentalFactors": analysis.fundamental_factors,
                "outlook": analysis.outlook,
                "timestamp": datetime.now().isoformat()
            } 
        except Exception as e:
            logger.exception(f"Error generating analysis: {str(e)}")
            raise