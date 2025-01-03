import React, { useState, useEffect } from 'react';
import { Send, TrendingUp, LineChart as LineChartIcon, Share2, Moon, Sun, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocation } from 'react-router-dom';
import ApiClient from '@/util/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/util/theme';
import { cn } from '@/util/utils';

interface StockData {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  returns: number;
  ma20: number;
  ma50: number;
  ma200: number;
}

interface AnalysisText {
  summary: string;
  technicalFactors: string[];
  fundamentalFactors: string[];
  outlook: string;
  timestamp: string;
}

interface ExamplePromptProps {
  text: string;
  onClick: (text: string) => void;
}

interface ResultPageProps {
  stockData: StockData[];
  analysisText: AnalysisText | null;
  shareId?: string;
}

// Add new interfaces for card data
interface CardData {
  title: string;
  metrics: {
    label: string;
    value: string | number;
    type?: 'positive' | 'negative' | 'neutral';
  }[];
}

interface AnalysisTextProps {
  analysisText: {
    summary: string;
    technicalFactors: string[];
    fundamentalFactors: string[];
    outlook: string;
  };
}

function AnalysisText({ analysisText }: AnalysisTextProps) {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="font-semibold mb-2">Summary</h3>
        <p className="text-gray-700 dark:text-gray-300">{analysisText.summary}</p>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Technical Analysis</h3>
        {analysisText.technicalFactors.map((factor, index) => (
          <p key={index} className="text-gray-700 dark:text-gray-300 mb-2">
            {factor}
          </p>
        ))}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Fundamental Analysis</h3>
        {analysisText.fundamentalFactors.map((factor, index) => (
          <p key={index} className="text-gray-700 dark:text-gray-300 mb-2">
            {factor}
          </p>
        ))}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Outlook</h3>
        <p className="text-gray-700 dark:text-gray-300">{analysisText.outlook}</p>
      </div>
    </div>
  );
}

function App() {
  const [message, setMessage] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [analysisText, setAnalysisText] = useState<AnalysisText | null>(null);
  const [shareId, setShareId] = useState<string | undefined>();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'share' && pathParts[2]) {
      const analysisId = pathParts[2];
      ApiClient.getSharedAnalysis(analysisId)
        .then(data => {
          setStockData(data.stockData);
          setAnalysisText(data.analysisText);
          setShareId(analysisId);
          setShowResult(true);
        })
        .catch(error => console.error('Error:', error));
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const data = await ApiClient.analyzeStock(message);
      setStockData(data.stockData);
      setAnalysisText(data.analysisText);
      setShareId(data.shareId);
      setShowResult(true);
    } catch (error) {
      console.error('Error:', error);
    }

    setMessage('');
  };

  const handleExampleClick = (text: string) => {
    setMessage(text);
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "bg-gray-900" : "bg-gray-100"
    )}>
      {/* Header */}
      <header className={cn(
        "backdrop-blur-lg bg-white/75 dark:bg-gray-900/75 shadow-sm sticky top-0 z-10 transition-colors duration-300"
      )}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              StockSage AI
            </h1>
          </motion.div>
          <nav className="flex space-x-4 items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              variant="outline"
              className="hidden md:flex items-center space-x-1 bg-white/50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <LineChartIcon className="h-4 w-4" />
              <span>Prediction</span>
            </Button>
            <Button 
              variant="outline"
              className="hidden md:flex items-center space-x-1 bg-white/50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <Card className={cn(
              "backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 shadow-lg",
              "border border-gray-200 dark:border-gray-700",
              "transition-all duration-300"
            )}>
              <CardContent className="p-3 md:p-4">
                <ScrollArea className="h-[calc(100vh-300px)] mb-6 pr-4">
                  <AnimatePresence mode="wait">
                    {showResult ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ResultPage stockData={stockData} analysisText={analysisText} shareId={shareId} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="welcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <WelcomeMessage onExampleClick={handleExampleClick} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ScrollArea>

                {/* Message Input */}
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="flex space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about any stock or market trend..."
                    className={cn(
                      "flex-1",
                      "bg-white/50 dark:bg-gray-700/50",
                      "border-gray-200 dark:border-gray-600",
                      "focus:ring-2 focus:ring-primary/50",
                      "transition-colors duration-200"
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="flex items-center space-x-2 hover:scale-105 transition-transform"
                  >
                    <span className="hidden md:inline">Send</span>
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

interface WelcomeMessageProps {
  onExampleClick: (text: string) => void;
}

function WelcomeMessage({ onExampleClick }: WelcomeMessageProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome to StockSage AI
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Ask me anything about stocks, market trends, or financial analysis. Try these examples:
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExamplePrompt text="How did Tesla perform last year?" onClick={onExampleClick} />
        <ExamplePrompt text="Show me a random trending tech stock." onClick={onExampleClick} />
        <ExamplePrompt text="NVIDIA price for the past week." onClick={onExampleClick} />
        <ExamplePrompt text="Apple stock performance in the last 6 months in a 1 day interval." onClick={onExampleClick} />
      </div>
    </div>
  );
}

function ExamplePrompt({ text, onClick }: ExamplePromptProps) {
  return (
    <Button 
      variant="outline" 
      className="text-left h-auto w-full justify-start"
      onClick={() => onClick(text)}
    >
      <p>{text}</p>
    </Button>
  );
}

function ResultPage({ stockData, analysisText, shareId }: ResultPageProps) {
  const [activeMetrics, setActiveMetrics] = useState({
    price: true,
    ma20: true,
    ma50: true,
    ma200: true,
    volume: true,
    returns: true
  });
  const { isDarkMode } = useThemeStore();

  // Format date for x-axis
  const formatXAxis = (tickItem: string) => {
    return new Date(tickItem).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const chartColors = {
    price: isDarkMode ? "#a78bfa" : "#7c3aed",
    ma20: isDarkMode ? "#6ee7b7" : "#059669",
    ma50: isDarkMode ? "#fcd34d" : "#d97706",
    ma200: isDarkMode ? "#ff7f7f" : "#dc2626",
    returns: isDarkMode ? "#93c5fd" : "#2563eb"
  };

  const textStyles = {
    title: "text-base font-semibold text-gray-900 dark:text-white",
    label: "text-sm text-gray-500 dark:text-gray-400",
    value: "text-lg font-bold text-gray-900 dark:text-white",
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400"
  };

  // Function to generate technical cards data
  const getTechnicalCards = (): CardData[] => {
    const latest = stockData[stockData.length - 1];
    
    return [
      {
        title: "Price Summary",
        metrics: [
          {
            label: "Current",
            value: `$${latest.price.toFixed(2)}`,
          },
          {
            label: "Daily Chg",
            value: `${latest.returns >= 0 ? '+' : ''}${latest.returns.toFixed(2)}%`,
            type: latest.returns >= 0 ? 'positive' : 'negative',
          },
          {
            label: "YTD",
            value: `${((latest.price / stockData[0].price - 1) * 100).toFixed(1)}%`,
            type: latest.price > stockData[0].price ? 'positive' : 'negative',
          },
        ],
      },
      {
        title: "Trading Statistics",
        metrics: [
          {
            label: "52-Week High",
            value: `$${Math.max(...stockData.map(d => d.high)).toFixed(2)}`,
          },
          {
            label: "52-Week Low",
            value: `$${Math.min(...stockData.map(d => d.low)).toFixed(2)}`,
          },
          {
            label: "Range Width",
            value: `${((Math.max(...stockData.map(d => d.high)) - Math.min(...stockData.map(d => d.low))) / Math.min(...stockData.map(d => d.low)) * 100).toFixed(2)}%`,
          },
        ],
      },
      {
        title: "Moving Average Status",
        metrics: [
          {
            label: "vs MA20",
            value: `${((latest.price / latest.ma20 - 1) * 100).toFixed(2)}%`,
            type: latest.price > latest.ma20 ? 'positive' : 'negative',
          },
          {
            label: "vs MA50",
            value: `${((latest.price / latest.ma50 - 1) * 100).toFixed(2)}%`,
            type: latest.price > latest.ma50 ? 'positive' : 'negative',
          },
          {
            label: "vs MA200",
            value: `${((latest.price / latest.ma200 - 1) * 100).toFixed(2)}%`,
            type: latest.price > latest.ma200 ? 'positive' : 'negative',
          },
        ],
      },
      {
        title: "Volume Metrics",
        metrics: [
          {
            label: "Today",
            value: `${(latest.volume / 1000000).toFixed(2)}M`,
          },
          {
            label: "Average",
            value: `${(stockData.reduce((acc, curr) => acc + curr.volume, 0) / stockData.length / 1000000).toFixed(2)}M`,
          },
          {
            label: "Change",
            value: `${((latest.volume / (stockData.reduce((acc, curr) => acc + curr.volume, 0) / stockData.length) - 1) * 100).toFixed(2)}%`,
            type: latest.volume > (stockData.reduce((acc, curr) => acc + curr.volume, 0) / stockData.length) ? 'positive' : 'negative',
          },
        ],
      },
      {
        title: "Trend Indicators",
        metrics: [
          {
            label: "Trend",
            value: latest.price > latest.ma200 ? 'Bullish' : 'Bearish',
            type: latest.price > latest.ma200 ? 'positive' : 'negative',
          },
          {
            label: "MA Spread",
            value: `${Math.abs((latest.ma50 / latest.ma200 - 1) * 100).toFixed(2)}%`,
          },
          {
            label: "Position",
            value: latest.price > latest.ma50 ? 'Above MA50' : 'Below MA50',
            type: latest.price > latest.ma50 ? 'positive' : 'negative',
          },
        ],
      },
      {
        title: "Risk & Volatility",
        metrics: [
          {
            label: "Daily Vol",
            value: `${(stockData.reduce((acc, curr) => acc + Math.pow(curr.returns, 2), 0) / stockData.length).toFixed(2)}%`,
          },
          {
            label: "Annual Vol",
            value: `${(Math.sqrt(252) * (stockData.reduce((acc, curr) => acc + Math.pow(curr.returns, 2), 0) / stockData.length)).toFixed(2)}%`,
          },
          {
            label: "Beta",
            value: analysisText?.fundamentalFactors.find(f => f.startsWith('Beta:'))?.split(': ')[1] || 'N/A',
          },
        ],
      },
    ];
  };

  // Function to generate fundamental cards data
  const getFundamentalCards = (): CardData[] => {
    const fundamentals = analysisText?.fundamentalFactors || [];
    
    // Helper function to extract value from fundamental factors
    const getValue = (prefix: string): string => {
        const factor = fundamentals.find(f => f.startsWith(prefix));
        return factor ? factor.split(': ')[1] : 'N/A';
    };

    // Helper function to format market cap
    const formatMarketCap = (value: string): string => {
        if (value === 'N/A') return 'N/A';
        const num = parseFloat(value.replace(/,/g, ''));
        if (isNaN(num)) return 'N/A';
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        return value;
    };

    return [
        {
            title: "Company Overview",
            metrics: [
                {
                    label: "Market Cap",
                    value: formatMarketCap(getValue("Market Cap")),
                },
                {
                    label: "Sector",
                    value: getValue("Sector"),
                },
                {
                    label: "Industry",
                    value: getValue("Industry"),
                },
            ],
        },
        {
            title: "Price Ratios",
            metrics: [
                {
                    label: "P/E (TTM)",
                    value: getValue("P/E Ratio (Trailing)"),
                },
                {
                    label: "P/E (FWD)",
                    value: getValue("P/E Ratio (Forward)"),
                },
                {
                    label: "P/B Ratio",
                    value: getValue("Price/Book Ratio"),
                },
            ],
        },
        {
            title: "Earnings",
            metrics: [
                {
                    label: "EPS (TTM)",
                    value: `$${getValue("EPS (Trailing)")}`,
                },
                {
                    label: "EPS (FWD)",
                    value: `$${getValue("EPS (Forward)")}`,
                },
                {
                    label: "EPS Growth",
                    value: calculateEPSGrowth(getValue("EPS (Forward)"), getValue("EPS (Trailing)")),
                    type: calculateGrowthType(getValue("EPS (Forward)"), getValue("EPS (Trailing)")),
                },
            ],
        },
        {
            title: "Margins",
            metrics: [
                {
                    label: "Operating",
                    value: getValue("Operating Margin"),
                },
                {
                    label: "Profit",
                    value: getValue("Profit Margin"),
                },
                {
                    label: "Margin Diff",
                    value: calculateMarginDiff(getValue("Operating Margin"), getValue("Profit Margin")),
                },
            ],
        },
        {
            title: "Risk Metrics",
            metrics: [
                {
                    label: "Beta",
                    value: getValue("Beta"),
                    type: calculateBetaType(getValue("Beta")),
                },
                {
                    label: "Volatility",
                    value: `${(stockData.reduce((acc, curr) => acc + Math.pow(curr.returns, 2), 0) / stockData.length * Math.sqrt(252)).toFixed(2)}%`,
                },
                {
                    label: "52W Range",
                    value: `${((stockData[stockData.length - 1].price / Math.min(...stockData.map(d => d.low)) - 1) * 100).toFixed(2)}%`,
                },
            ],
        },
        {
            title: "Income & Yield",
            metrics: [
                {
                    label: "Div Yield",
                    value: getValue("Dividend Yield"),
                },
                {
                    label: "Payout Ratio",
                    value: calculatePayoutRatio(getValue("Dividend Yield"), getValue("EPS (Trailing)")),
                },
                {
                    label: "Yield Type",
                    value: categorizeYield(getValue("Dividend Yield")),
                },
            ],
        },
    ];
  };

  // Helper functions for calculations
  const calculateEPSGrowth = (fwd: string, ttm: string): string => {
    const fwdNum = parseFloat(fwd);
    const ttmNum = parseFloat(ttm);
    if (isNaN(fwdNum) || isNaN(ttmNum) || ttmNum === 0) return 'N/A';
    const growth = ((fwdNum / ttmNum - 1) * 100);
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
  };

  const calculateGrowthType = (fwd: string, ttm: string): 'positive' | 'negative' | undefined => {
    const fwdNum = parseFloat(fwd);
    const ttmNum = parseFloat(ttm);
    if (isNaN(fwdNum) || isNaN(ttmNum)) return undefined;
    return fwdNum > ttmNum ? 'positive' : 'negative';
  };

  const calculateMarginDiff = (operating: string, profit: string): string => {
    const opNum = parseFloat(operating);
    const profitNum = parseFloat(profit);
    if (isNaN(opNum) || isNaN(profitNum)) return 'N/A';
    return `${(opNum - profitNum).toFixed(2)}%`;
  };

  const calculateBetaType = (beta: string): 'positive' | 'negative' | undefined => {
    const betaNum = parseFloat(beta);
    if (isNaN(betaNum)) return undefined;
    return Math.abs(betaNum - 1) < 0.1 ? undefined : betaNum > 1 ? 'negative' : 'positive';
  };

  const calculatePayoutRatio = (yield_: string, eps: string): string => {
    const yieldNum = parseFloat(yield_);
    const epsNum = parseFloat(eps);
    if (isNaN(yieldNum) || isNaN(epsNum) || epsNum === 0) return 'N/A';
    return `${((yieldNum / 100) * stockData[stockData.length - 1].price / epsNum * 100).toFixed(2)}%`;
  };

  const categorizeYield = (yield_: string): string => {
    const yieldNum = parseFloat(yield_);
    if (isNaN(yieldNum)) return 'N/A';
    if (yieldNum === 0) return 'No Dividend';
    if (yieldNum < 2) return 'Low Yield';
    if (yieldNum < 4) return 'Moderate';
    return 'High Yield';
  };

  // Render a metric card
  const MetricCard = ({ data }: { data: CardData }) => (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={cn(
        "h-[180px]",
        "bg-white/95 dark:bg-gray-800/95",
        "border border-gray-100 dark:border-gray-700",
        "shadow-sm hover:shadow-md transition-shadow"
      )}>
        <CardContent className="pt-3">
          <div className="text-center">
            <h3 className={cn(textStyles.title, "mb-2")}>{data.title}</h3>
            <div className="space-y-1.5">
              {data.metrics.map((metric, idx) => (
                <div key={idx} className="flex justify-between items-center px-2">
                  <p className={cn(textStyles.label, "text-xs")}>{metric.label}</p>
                  <p className={cn(
                    "text-sm font-semibold",
                    metric.type === 'positive' && textStyles.positive,
                    metric.type === 'negative' && textStyles.negative
                  )}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section with Price and Share Button */}
      <motion.div 
        className="flex justify-between items-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">
              {analysisText?.summary.split(' ')[0]}
            </h2>
            <span className="text-3xl font-bold text-primary dark:text-primary">
              ${stockData[stockData.length - 1]?.price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-lg",
              stockData[stockData.length - 1]?.returns >= 0 
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}>
              ${stockData[stockData.length - 1]?.price - stockData[stockData.length - 2]?.price > 0 ? "+" : ""}
              ${(stockData[stockData.length - 1]?.price - stockData[stockData.length - 2]?.price).toFixed(2)}
              ({stockData[stockData.length - 1]?.returns >= 0 ? "+" : ""}
              {stockData[stockData.length - 1]?.returns.toFixed(2)}%)
            </span>
            <span className="text-sm text-gray-500">Today</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ShareButton shareId={shareId} />
          {analysisText?.timestamp && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(analysisText.timestamp).toLocaleString()}
            </span>
          )}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart and Technical Metrics */}
        <div className="lg:col-span-2 space-y-4">
          {/* Metric toggles */}
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm"
              variant={activeMetrics.price ? "default" : "outline"}
              onClick={() => setActiveMetrics(m => ({ ...m, price: !m.price }))}
              className={cn(
                "dark:text-gray-200",
                activeMetrics.price ? "dark:bg-gray-700" : "dark:border-gray-600"
              )}
            >
              Price
            </Button>
            <Button 
              size="sm"
              variant={activeMetrics.ma20 ? "default" : "outline"}
              onClick={() => setActiveMetrics(m => ({ ...m, ma20: !m.ma20 }))}
              className={cn(
                "dark:text-gray-200",
                activeMetrics.ma20 ? "dark:bg-gray-700" : "dark:border-gray-600"
              )}
            >
              20-Day MA
            </Button>
            <Button 
              size="sm"
              variant={activeMetrics.ma50 ? "default" : "outline"}
              onClick={() => setActiveMetrics(m => ({ ...m, ma50: !m.ma50 }))}
              className={cn(
                "dark:text-gray-200",
                activeMetrics.ma50 ? "dark:bg-gray-700" : "dark:border-gray-600"
              )}
            >
              50-Day MA
            </Button>
            <Button 
              size="sm"
              variant={activeMetrics.ma200 ? "default" : "outline"}
              onClick={() => setActiveMetrics(m => ({ ...m, ma200: !m.ma200 }))}
              className={cn(
                "dark:text-gray-200",
                activeMetrics.ma200 ? "dark:bg-gray-700" : "dark:border-gray-600"
              )}
            >
              200-Day MA
            </Button>
            <Button 
              size="sm"
              variant={activeMetrics.returns ? "default" : "outline"}
              onClick={() => setActiveMetrics(m => ({ ...m, returns: !m.returns }))}
              className={cn(
                "dark:text-gray-200",
                activeMetrics.returns ? "dark:bg-gray-700" : "dark:border-gray-600"
              )}
            >
              Returns
            </Button>
          </div>

          {/* Price Chart */}
          <Card className="p-4">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
                  />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatXAxis}
                    stroke={isDarkMode ? "#fff" : "#000"}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke={isDarkMode ? "#fff" : "#000"}
                    label={{ 
                      value: 'Price ($)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: isDarkMode ? "#fff" : "#000" }
                    }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ 
                      value: 'Returns (%)', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { fill: isDarkMode ? "#fff" : "#000" }
                    }} 
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'returns') return [`${value.toFixed(2)}%`, 'Returns'];
                      if (name === 'volume') return [`${(value/1000000).toFixed(2)}M`, 'Volume'];
                      return [`$${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)];
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    contentStyle={{
                      color: '#FFFFFF',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      fontWeight: 'bold'
                    }}
                  />
                  <Legend />
                  {activeMetrics.price && (
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={chartColors.price}
                      yAxisId="left"
                      name="Price"
                      dot={false}
                    />
                  )}
                  {activeMetrics.ma20 && (
                    <Line 
                      type="monotone" 
                      dataKey="ma20" 
                      stroke={chartColors.ma20}
                      yAxisId="left"
                      name="20-Day MA"
                      dot={false}
                    />
                  )}
                  {activeMetrics.ma50 && (
                    <Line 
                      type="monotone" 
                      dataKey="ma50" 
                      stroke={chartColors.ma50}
                      yAxisId="left"
                      name="50-Day MA"
                      dot={false}
                    />
                  )}
                  {activeMetrics.ma200 && (
                    <Line 
                      type="monotone" 
                      dataKey="ma200" 
                      stroke={chartColors.ma200}
                      yAxisId="left"
                      name="200-Day MA"
                      dot={false}
                    />
                  )}
                  {activeMetrics.returns && (
                    <Line 
                      type="monotone" 
                      dataKey="returns" 
                      stroke={chartColors.returns}
                      yAxisId="right"
                      name="Returns"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Technical Analysis Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Technical Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getTechnicalCards().map((cardData, index) => (
                <MetricCard key={`tech-${index}`} data={cardData} />
              ))}
            </div>
          </div>

          {/* Fundamental Analysis Section */}
          <div className="space-y-4 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Fundamental Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getFundamentalCards().map((cardData, index) => (
                <MetricCard key={`fund-${index}`} data={cardData} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Analysis */}
        <div className="space-y-4">
          {analysisText && (
            <Card className="col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalysisText analysisText={analysisText} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ShareButton({ shareId }: { shareId?: string }) {
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    // You might want to add a toast notification here
    alert('Share link copied to clipboard!');
  };

  return (
    <Button
      onClick={handleShare}
      className="flex items-center space-x-2"
      disabled={!shareId}
    >
      <Share2 className="h-4 w-4" />
      <span>Share Analysis</span>
    </Button>
  );
}

export default App;
