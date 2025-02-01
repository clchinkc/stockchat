from datetime import datetime, timedelta
import yfinance as yf
import pandas as pd
import talib
from typing import Tuple, List, Dict, Any
import numpy as np
import time
import logging
from .dspy_service import DspyService

logger = logging.getLogger(__name__)

class StockService:
    _dspy_service = DspyService()

    @staticmethod
    def _period_to_days(period: str) -> int:
        """Convert yfinance period string to number of days."""
        if period == 'max':
            return None
        
        number = int(period[:-1])  # Get the number part
        unit = period[-1]  # Get the unit (d, mo, y, etc)
        
        if unit == 'd':
            return number
        elif unit == 'w':
            return number * 7
        elif unit == 'mo':
            return number * 30
        elif unit == 'y':
            return number * 365
        else:
            raise ValueError(f"Unsupported period format: {period}")

    @staticmethod
    def get_stock_data(query: str = "Show me Apple stock") -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        # Extract stock info using DSPy
        extracted_info = StockService._dspy_service.extract_stock_info(query)
        
        try:
            # Create ticker instance with extracted symbol
            ticker = yf.Ticker(extracted_info.symbol)
            
            # Always get max data for accurate calculations
            df = ticker.history(
                period='max',  # Always get max data
                interval=extracted_info.yfinance_interval
            )
            
            if len(df) == 0:
                logger.error(f"No data available for {extracted_info.symbol}")
                raise ValueError(f"No data available for {extracted_info.symbol}")

            if len(df) < 20:  # Minimum data needed for calculations
                logger.warning(f"Insufficient data for {extracted_info.symbol}: only {len(df)} days available")
                raise ValueError(f"Insufficient historical data for {extracted_info.symbol}")

            # Calculate all technical indicators on full dataset
            df['Returns'] = talib.ROC(df['Close'], timeperiod=1)
            df['MA20'] = talib.SMA(df['Close'], timeperiod=20)
            df['MA50'] = talib.SMA(df['Close'], timeperiod=50)
            df['MA200'] = talib.SMA(df['Close'], timeperiod=200)
            
            # Additional TA-Lib indicators
            df['RSI'] = talib.RSI(df['Close'], timeperiod=14)
            df['MACD'], df['MACD_Signal'], df['MACD_Hist'] = talib.MACD(df['Close'])
            df['BB_Upper'], df['BB_Middle'], df['BB_Lower'] = talib.BBANDS(df['Close'])
            
            # Volatility indicators
            df['ATR'] = talib.ATR(df['High'], df['Low'], df['Close'], timeperiod=14)
            df['NATR'] = talib.NATR(df['High'], df['Low'], df['Close'], timeperiod=14)
            
            # Volume indicators
            df['OBV'] = talib.OBV(df['Close'], df['Volume'])
            df['AD'] = talib.AD(df['High'], df['Low'], df['Close'], df['Volume'])
            
            # Momentum indicators
            df['MOM'] = talib.MOM(df['Close'], timeperiod=10)
            df['ROC'] = talib.ROC(df['Close'], timeperiod=10)

            # Trim to the requested period after all calculations are done
            if extracted_info.yfinance_period != 'max':
                try:
                    days = StockService._period_to_days(extracted_info.yfinance_period)
                    if days is not None:  # Skip if period is 'max'
                        df = df.tail(days)
                except ValueError as e:
                    logger.warning(f"Invalid period format: {extracted_info.yfinance_period}. Using all available data.")

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

            # Update technical metrics dictionary
            stats = {
                'technical': {
                    # Price metrics (from yfinance)
                    'current_price': round(latest_data['Close'], 2),
                    'daily_change': round(latest_data['Close'] - prev_day_data['Close'], 2),
                    
                    # Returns (TA-Lib ROC)
                    'daily_return': round(latest_data['Returns'], 2) if not pd.isna(latest_data['Returns']) else 0,
                    'yearly_return': round(latest_data['ROC'], 2) if not pd.isna(latest_data['ROC']) else 0,
                    
                    # Volume metrics (combination of yfinance and TA-Lib)
                    'daily_volume': int(latest_data['Volume']),
                    'obv': int(latest_data['OBV']),  # On Balance Volume
                    'ad_line': int(latest_data['AD']),  # Accumulation/Distribution Line
                    
                    # Volatility metrics (TA-Lib)
                    'atr': round(latest_data['ATR'], 2),  # Average True Range
                    'natr': round(latest_data['NATR'], 2),  # Normalized ATR
                    
                    # Momentum indicators (TA-Lib)
                    'momentum': round(latest_data['MOM'], 2),
                    'roc': round(latest_data['ROC'], 2),
                    'rsi': round(latest_data['RSI'], 2),
                    
                    # Moving Averages (TA-Lib)
                    'ma20': round(latest_data['MA20'], 2),
                    'ma50': round(latest_data['MA50'], 2),
                    'ma200': round(latest_data['MA200'], 2),
                    
                    # MACD (TA-Lib)
                    'macd': round(latest_data['MACD'], 2),
                    'macd_signal': round(latest_data['MACD_Signal'], 2),
                    'macd_hist': round(latest_data['MACD_Hist'], 2),
                    
                    # Bollinger Bands (TA-Lib)
                    'bb_upper': round(latest_data['BB_Upper'], 2),
                    'bb_middle': round(latest_data['BB_Middle'], 2),
                    'bb_lower': round(latest_data['BB_Lower'], 2),
                    
                    # Price extremes (from yfinance data)
                    'yearly_high': round(df['High'].max(), 2),
                    'yearly_low': round(df['Low'].min(), 2),
                    
                    # Metadata
                    'ticker': extracted_info.symbol,
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
            
            # Determine trend based on multiple TA-Lib indicators
            is_bullish = (
                (latest_data['MA50'] > latest_data['MA200']) and  # Long-term trend
                (latest_data['MACD'] > latest_data['MACD_Signal']) and  # Momentum
                (latest_data['RSI'] > 50) and  # RSI above midpoint
                (latest_data['Close'] > latest_data['BB_Middle'])  # Price above BB middle
            )
            
            # Calculate trend strength using multiple indicators
            ma_trend_strength = abs(latest_data['MA50'] - latest_data['MA200']) / latest_data['MA200'] * 100
            rsi_strength = abs(latest_data['RSI'] - 50)
            macd_strength = abs(latest_data['MACD_Hist']) / latest_data['Close'] * 100
            
            trend_strength = (ma_trend_strength + rsi_strength + macd_strength) / 3

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
                    "returns": round(float(row['Returns']) if not pd.isna(row['Returns']) else 0, 2),
                    "ma20": round(float(row['MA20']) if not pd.isna(row['MA20']) else row['Close'], 2),
                    "ma50": round(float(row['MA50']) if not pd.isna(row['MA50']) else row['Close'], 2),
                    "ma200": round(float(row['MA200']) if not pd.isna(row['MA200']) else row['Close'], 2),
                    "atr": round(float(row['ATR']) if not pd.isna(row['ATR']) else 0, 2),
                    "obv": int(row['OBV']) if not pd.isna(row['OBV']) else 0,
                    "ad": int(row['AD']) if not pd.isna(row['AD']) else 0,
                    "momentum": round(float(row['MOM']) if not pd.isna(row['MOM']) else 0, 2),
                    "roc": round(float(row['ROC']) if not pd.isna(row['ROC']) else 0, 2),
                    "natr": round(float(row['NATR']) if not pd.isna(row['NATR']) else 0, 2),
                    "rsi": round(float(row['RSI']) if not pd.isna(row['RSI']) else 50, 2),
                    "macd": round(float(row['MACD']) if not pd.isna(row['MACD']) else 0, 2),
                    "macd_signal": round(float(row['MACD_Signal']) if not pd.isna(row['MACD_Signal']) else 0, 2),
                    "bb_upper": round(float(row['BB_Upper']) if not pd.isna(row['BB_Upper']) else row['Close'], 2),
                    "bb_lower": round(float(row['BB_Lower']) if not pd.isna(row['BB_Lower']) else row['Close'], 2),
                })
            
            return price_data, stats

        except Exception as e:
            logger.exception(f"Error fetching stock data: {str(e)}")
            raise

    @staticmethod
    def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
        # Calculate all technical indicators here
        df['Returns'] = talib.ROC(df['Close'], timeperiod=1)
        
        # Moving Averages with full available history
        df['MA20'] = talib.SMA(df['Close'], timeperiod=20)
        df['MA50'] = talib.SMA(df['Close'], timeperiod=50)
        df['MA200'] = talib.SMA(df['Close'], timeperiod=200)
        
        # Fill NA values for MAs
        for ma in ['MA20', 'MA50', 'MA200']:
            df[ma].fillna(method='ffill', inplace=True)
            df[ma].fillna(method='bfill', inplace=True)
        
        # Calculate other indicators...
        
        return df

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