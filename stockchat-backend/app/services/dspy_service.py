import dspy
import os
from typing import Dict, Any, Tuple, List
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


# Configure DSPy
def get_available_llm():
    """Get the first available LLM based on environment variables."""
    if os.environ.get("OPENAI_API_KEY"):
        return dspy.LM(
            model="openai/gpt-4o-mini",
            api_key=os.environ["OPENAI_API_KEY"]
        )
    elif os.environ.get("DEEPSEEK_API_KEY"):
        return dspy.LM(
            model="deepseek/deepseek-chat",
            api_key=os.environ["DEEPSEEK_API_KEY"]
        )
    elif os.environ.get("GITHUB_TOKEN"):
        return dspy.LM(
            model="openai/gpt-4o-mini",
            api_base="https://models.inference.ai.azure.com",
            api_key=os.environ["GITHUB_TOKEN"]
        )
    elif os.environ.get("GEMINI_API_KEY"):
        return dspy.LM(
            model="gemini/gemini-2.0-flash-exp",
            api_key=os.environ["GEMINI_API_KEY"]
        )
    else:
        raise ValueError("No LLM API keys found in environment variables")

# Initialize the LLM and configure DSPy
active_llm = get_available_llm()
dspy.settings.configure(lm=active_llm, max_requests_per_minute=15, trace=[])

# Pydantic Models
class StockQuery(BaseModel):
    """Input query about a stock."""
    text: str = Field(description="The user's query about a stock")

class ExtractedInfo(BaseModel):
    """Extracted stock symbol and time period from query."""
    symbol: str = Field(description="The stock symbol (e.g., 'AAPL' for Apple)")
    yfinance_period: str = Field(description="The yfinance period parameter (one of ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'])")
    yfinance_interval: str = Field(description="The yfinance interval parameter (e.g., '1h', '1d', '1mo')")

class StockAnalysis(BaseModel):
    """Generated analysis of stock data."""
    summary: str = Field(description="Brief summary of the stock's performance")
    technical_factors: list[str] = Field(description="List of technical analysis points")
    fundamental_factors: list[str] = Field(description="List of fundamental analysis points")
    outlook: str = Field(description="Future outlook and recommendations")

# DSPy Signatures
class ExtractStockInfoSignature(dspy.Signature):
    """Extracts stock symbol and yfinance parameters from user query."""
    input: StockQuery = dspy.InputField(desc="User's query about a stock")
    output: ExtractedInfo = dspy.OutputField(desc="Extracted stock info with yfinance parameters")

class GenerateAnalysisSignature(dspy.Signature):
    """Generates structured analysis from stock data."""
    stats: Dict[str, Any] = dspy.InputField()
    output: StockAnalysis = dspy.OutputField()

class AnalysisEvaluator(dspy.Signature):
    """Evaluates the quality of generated stock analysis."""
    stats: Dict[str, Any] = dspy.InputField()
    analysis: StockAnalysis = dspy.InputField()
    accuracy_score: int = dspy.OutputField(desc="Score for factual accuracy (1-10)")
    completeness_score: int = dspy.OutputField(desc="Score for coverage of key metrics (1-10)")
    insight_score: int = dspy.OutputField(desc="Score for analytical insight and depth (1-10)")
    readability_score: int = dspy.OutputField(desc="Score for clarity and readability (1-10)")

def analysis_metric(gold: Any, pred: Any, trace: Any = None) -> float:
    """Metric function for evaluating stock analysis."""
    evaluator = dspy.Predict(AnalysisEvaluator)
    scores = evaluator(
        stats=gold.stats,
        analysis=pred
    )
    return (scores.accuracy_score + scores.completeness_score + 
            scores.insight_score + scores.readability_score) / 4

# DSPy Modules
class ExtractStockInfo(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.ChainOfThought(ExtractStockInfoSignature)
    
    def forward(self, input: StockQuery) -> ExtractedInfo:
        return self.predictor(input=input).output

class GenerateAnalysis(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.ChainOfThought(GenerateAnalysisSignature)
    
    def forward(self, stats: Dict[str, Any]) -> StockAnalysis:
        """Generate comprehensive stock analysis."""
        # Format fundamental factors with proper prefixes and values
        fundamental_factors = [
            f"Market Cap: {stats['fundamental']['marketCap']:,.2f}" if stats['fundamental']['marketCap'] is not None else "Market Cap: N/A",
            f"P/E Ratio (Trailing): {stats['fundamental']['trailingPE']:.2f}" if stats['fundamental']['trailingPE'] is not None else "P/E Ratio (Trailing): N/A",
            f"P/E Ratio (Forward): {stats['fundamental']['forwardPE']:.2f}" if stats['fundamental']['forwardPE'] is not None else "P/E Ratio (Forward): N/A",
            f"Price/Book Ratio: {stats['fundamental']['priceToBook']:.2f}" if stats['fundamental']['priceToBook'] is not None else "Price/Book Ratio: N/A",
            f"Beta: {stats['fundamental']['beta']:.2f}" if stats['fundamental']['beta'] is not None else "Beta: N/A",
            f"Dividend Yield: {stats['fundamental']['dividendYield']:.2f}%" if stats['fundamental']['dividendYield'] is not None else "Dividend Yield: N/A",
            f"EPS (Trailing): {stats['fundamental']['trailingEps']:.2f}" if stats['fundamental']['trailingEps'] is not None else "EPS (Trailing): N/A",
            f"EPS (Forward): {stats['fundamental']['forwardEps']:.2f}" if stats['fundamental']['forwardEps'] is not None else "EPS (Forward): N/A",
            f"Profit Margin: {stats['fundamental']['profitMargins']:.2f}%" if stats['fundamental']['profitMargins'] is not None else "Profit Margin: N/A",
            f"Operating Margin: {stats['fundamental']['operatingMargins']:.2f}%" if stats['fundamental']['operatingMargins'] is not None else "Operating Margin: N/A",
            f"Sector: {stats['fundamental']['sector']}" if stats['fundamental']['sector'] is not None else "Sector: N/A",
            f"Industry: {stats['fundamental']['industry']}" if stats['fundamental']['industry'] is not None else "Industry: N/A"
        ]
        
        # Call predictor with the stats parameter
        result = self.predictor(stats=stats)
        result.output.fundamental_factors = fundamental_factors
        return result.output

# Evaluation Signatures and Functions
class StockInfoEvaluator(dspy.Signature):
    """Evaluates the quality of extracted stock information."""
    query: StockQuery = dspy.InputField()
    extracted: ExtractedInfo = dspy.InputField()
    accuracy_score: int = dspy.OutputField(desc="Score for accuracy of symbol extraction (1-10)")
    period_score: int = dspy.OutputField(desc="Score for yfinance parameter correctness (1-10)")
    relevance_score: int = dspy.OutputField(desc="Score for relevance to the query (1-10)")

def stock_info_metric(gold: Any, pred: Any, trace: Any = None) -> float:
    """Metric function for evaluating stock info extraction."""
    evaluator = dspy.Predict(StockInfoEvaluator)
    scores = evaluator(
        query=gold.input,
        extracted=pred
    )
    return (scores.accuracy_score + scores.period_score + scores.relevance_score) / 3

# Main Service Class
class DspyService:
    def __init__(self):
        # Initialize modules
        self.extractor = ExtractStockInfo()
        self.analyzer = GenerateAnalysis()
        
        # Configure teleprompters
        self.extract_teleprompter = dspy.teleprompt.BootstrapFewShot(
            metric=stock_info_metric,
            max_bootstrapped_demos=3,
            max_rounds=2
        )
        
        self.analysis_teleprompter = dspy.teleprompt.BootstrapFewShot(
            metric=analysis_metric,
            max_bootstrapped_demos=3,
            max_rounds=2
        )
        
        # Compile modules separately
        self._compile_extractor()
        self._compile_analyzer()
    
    def _compile_extractor(self):
        """Compile the stock info extractor."""
        example_queries = [
            dspy.Example(
                input=StockQuery(text="Show me Apple stock performance"),
                output=ExtractedInfo(
                    symbol="AAPL",
                    yfinance_period="1y",
                    yfinance_interval="1d"
                )
            ).with_inputs("input"),
            dspy.Example(
                input=StockQuery(text="How did Tesla do last month?"),
                output=ExtractedInfo(
                    symbol="TSLA",
                    yfinance_period="1mo",
                    yfinance_interval="1d"
                )
            ).with_inputs("input"),
            dspy.Example(
                input=StockQuery(text="NVDA price for the past week"),
                output=ExtractedInfo(
                    symbol="NVDA",
                    yfinance_period="5d",
                    yfinance_interval="1h"
                )
            ).with_inputs("input"),
            dspy.Example(
                input=StockQuery(text="Show me Microsoft's 6-month trend"),
                output=ExtractedInfo(
                    symbol="MSFT",
                    yfinance_period="6mo",
                    yfinance_interval="1d"
                )
            ).with_inputs("input"),
            dspy.Example(
                input=StockQuery(text="AMD stock price today"),
                output=ExtractedInfo(
                    symbol="AMD",
                    yfinance_period="1d",
                    yfinance_interval="1m"
                )
            ).with_inputs("input"),
        ]
        
        self.extractor = self.extract_teleprompter.compile(
            self.extractor, 
            trainset=example_queries
        )
    
    def _compile_analyzer(self):
        """Compile the analysis generator."""
        example_analyses = [
            dspy.Example(
                stats={
                    'technical': {
                        'ticker': 'AAPL',
                        'current_price': 150.25,
                        'daily_change': 2.5,
                        'daily_return': 1.67,
                        'trend': 'bullish',
                        'trend_strength': 5.23,
                        'daily_volume': 85000000,
                        'avg_daily_volume': 75000000,
                        'yearly_high': 182.50,
                        'yearly_low': 124.75,
                        'daily_volatility': 1.45,
                        'avg_daily_return': 0.12,
                        'annualized_volatility': 23.15,
                    },
                    'fundamental': {
                        'marketCap': 2.5e12,
                        'sector': 'Technology',
                        'industry': 'Consumer Electronics',
                        'trailingPE': 28.5,
                        'forwardPE': 25.3,
                        'priceToBook': 35.2,
                        'beta': 1.2,
                        'dividendYield': 0.65,
                        'trailingEps': 5.27,
                        'forwardEps': 5.95,
                        'profitMargins': 25.3,
                        'operatingMargins': 30.1
                    }
                },
                output=StockAnalysis(
                    summary=(
                        "AAPL shows strong momentum with a bullish trend, currently trading at $150.25 with a positive daily return of 1.67%. "
                        "The stock demonstrates robust technical strength with a 5.23% trend confirmation based on moving average analysis. "
                        "As a $2.5T market cap leader in the Technology sector, Apple maintains strong profit margins and healthy growth metrics."
                    ),
                    technical_factors=[
                        "The stock's technical profile shows impressive strength, with the price maintaining a clear upward trajectory above all major moving averages. "
                        "Market participation remains robust, as evidenced by daily trading volume of 85 million shares exceeding the average of 75 million, "
                        "suggesting strong institutional and retail interest in the stock.",
                        
                        "Price action has established a broad trading range between $124.75 and $182.50 over the past year, "
                        "with current levels suggesting potential for further upside movement. The stock's volatility metrics are favorable, "
                        "showing a moderate daily volatility of 1.45% that indicates stable yet dynamic price movement.",
                        
                        "The annualized volatility of 23.15% aligns well with market expectations for a large-cap technology stock, "
                        "providing a balanced risk profile for investors. Recent price momentum and volume patterns suggest continued strength "
                        "in the established uptrend."
                    ],
                    fundamental_factors=[
                        "Apple's market leadership is underscored by its impressive $2.5 trillion market capitalization, positioning it among "
                        "the world's most valuable companies. The company's operational excellence is reflected in its robust profit margins of 25.3%, "
                        "demonstrating efficient cost management and strong pricing power in the competitive consumer electronics market.",
                        
                        "Valuation metrics appear reasonable given the company's growth trajectory, with a forward P/E ratio of 25.3x suggesting "
                        "market confidence in future earnings potential. The company's beta of 1.2 indicates slightly higher market sensitivity, "
                        "though this is typical for leading technology stocks.",
                        
                        "The dividend profile, while modest at 0.65%, is well-supported by strong earnings per share of $5.27, with forward estimates "
                        "suggesting continued growth. This combination of dividend stability and earnings growth potential provides a compelling case "
                        "for both income and growth investors."
                    ],
                    outlook=(
                        "Technical indicators suggest continued upward momentum with strong volume support. "
                        "The combination of robust fundamentals, including expanding margins and growing EPS (forward $5.95), "
                        "positions AAPL favorably for sustained growth. Investors should monitor volume patterns and price action "
                        "near the yearly high of $182.50 for potential breakout opportunities."
                    )
                )
            ).with_inputs("stats"),
            dspy.Example(
                stats={
                    'technical': {
                        'ticker': 'MSFT',
                        'current_price': 375.85,
                        'daily_change': -2.15,
                        'daily_return': -0.57,
                        'trend': 'bullish',
                        'trend_strength': 8.45,
                        'daily_volume': 28500000,
                        'avg_daily_volume': 25000000,
                        'yearly_high': 384.30,
                        'yearly_low': 242.15,
                        'daily_volatility': 1.25,
                        'avg_daily_return': 0.15,
                        'annualized_volatility': 19.85,
                    },
                    'fundamental': {
                        'marketCap': 2.8e12,
                        'sector': 'Technology',
                        'industry': 'Software',
                        'trailingPE': 32.4,
                        'forwardPE': 29.8,
                        'priceToBook': 12.5,
                        'beta': 0.95,
                        'dividendYield': 0.85,
                        'trailingEps': 11.58,
                        'forwardEps': 12.61,
                        'profitMargins': 35.8,
                        'operatingMargins': 42.5
                    }
                },
                output=StockAnalysis(
                    summary=(
                        "MSFT exhibits strong market positioning despite a minor daily decline of -0.57% to $375.85. "
                        "The stock maintains a robust bullish trend with 8.45% trend strength, supported by exceptional fundamentals. "
                        "As the largest software company with a $2.8T market cap, Microsoft continues to demonstrate industry-leading profitability."
                    ),
                    technical_factors=[
                        "Microsoft's technical analysis reveals a compelling bullish narrative, with the stock's moving averages showing a strong 8.45% separation, "
                        "confirming the strength of the current uptrend. The stock is trading near its yearly peak of $384.30, demonstrating powerful momentum "
                        "and suggesting strong buyer conviction at these elevated levels.",
                        
                        "Trading activity remains robust with daily volume of 28.5 million shares surpassing the average of 25 million, "
                        "indicating sustained institutional commitment to the stock. The volatility profile is particularly attractive, "
                        "with an annualized volatility of 19.85% reflecting controlled and steady price advancement.",
                        
                        "The stock's average daily return of 0.15% compounds to significant gains over time, while the moderate volatility "
                        "suggests a well-balanced risk-reward profile. The current price action shows resilience even during minor pullbacks, "
                        "supporting the overall bullish technical structure."
                    ],
                    fundamental_factors=[
                        "Microsoft's fundamental strength is anchored by its commanding $2.8 trillion market capitalization, reflecting its "
                        "dominance in the enterprise software market and growing cloud computing presence. The company's operational excellence "
                        "is particularly noteworthy, with industry-leading operating margins of 42.5% demonstrating exceptional efficiency and "
                        "pricing power.",
                        
                        "The company's valuation metrics remain justified by its growth trajectory, with a forward P/E of 29.8x reflecting strong "
                        "market confidence in future earnings potential. The stock's defensive characteristics are enhanced by a beta of 0.95, "
                        "suggesting slightly lower volatility than the broader market - a rare feature for a high-growth technology leader.",
                        
                        "Earnings momentum remains strong with EPS expected to grow from $11.58 to $12.61, supporting both the current dividend "
                        "yield of 0.85% and ongoing investment in growth initiatives. This combination of earnings growth, dividend stability, "
                        "and market leadership creates a compelling investment case."
                    ],
                    outlook=(
                        "MSFT's technical and fundamental strength suggests continued upward potential. "
                        "The combination of strong profit margins, growing earnings, and robust technical trends "
                        "supports a positive outlook. Watch for potential consolidation near the yearly high "
                        "before possible continuation of the uptrend."
                    )
                )
            ).with_inputs("stats")
        ]
        
        self.analyzer = self.analysis_teleprompter.compile(
            self.analyzer, 
            trainset=example_analyses
        )

    def extract_stock_info(self, query: str) -> ExtractedInfo:
        """Extract stock info from a text query."""
        return self.extractor(input=StockQuery(text=query))

    def generate_analysis(self, stats: Dict[str, Any]) -> StockAnalysis:
        """Generate analysis from stock statistics."""
        return self.analyzer(stats=stats) 