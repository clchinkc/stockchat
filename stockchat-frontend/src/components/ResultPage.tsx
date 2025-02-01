import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/util/utils';
import { TradingSignal } from '@/components/TradingSignal';
import { AnalysisText } from '@/components/AnalysisText';
import { MetricCard } from '@/components/MetricCard';
import { StockChart } from '@/components/StockChart';
import { StockHeader } from '@/components/StockHeader';

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
  atr: number;
  obv: number;
  ad: number;
  momentum: number;
  roc: number;
  natr: number;
  rsi: number;
  macd: number;
  macd_signal: number;
  bb_upper: number;
  bb_lower: number;
}

interface AnalysisText {
  summary: string;
  technicalFactors: string[];
  fundamentalFactors: string[];
  outlook: string;
  timestamp: string;
}

interface ResultPageProps {
  stockData: StockData[];
  analysisText: AnalysisText | null;
  shareId?: string;
  stats: {
    technical: {
      atr: number;
      natr: number;
      obv: number;
      ad_line: number;
      momentum: number;
      roc: number;
    };
  };
}

interface CardData {
  title: string;
  metrics: {
    label: string;
    value: string | number;
    type?: 'positive' | 'negative' | 'neutral';
  }[];
}

export function ResultPage({ stockData, analysisText, shareId, stats }: ResultPageProps) {
  const [activeMetrics, setActiveMetrics] = useState({
    price: true,
    ma20: false,
    ma50: false,
    ma200: false,
    volume: false,
    returns: false
  });

  const textStyles = {
    title: "text-base font-semibold text-gray-900 dark:text-white",
    label: "text-sm text-gray-600 dark:text-gray-400",
    value: "text-lg font-bold text-gray-900 dark:text-white",
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-yellow-600 dark:text-yellow-400"
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
        title: "Technical Indicators",
        metrics: [
          {
            label: "RSI",
            value: `${latest.rsi.toFixed(2)}`,
            type: latest.rsi > 70 ? 'negative' : latest.rsi < 30 ? 'positive' : 'neutral'
          },
          {
            label: "MACD",
            value: `${latest.macd.toFixed(2)}`,
            type: latest.macd > latest.macd_signal ? 'positive' : 'negative'
          },
          {
            label: "ATR",
            value: `${latest.atr.toFixed(2)}`,
          }
        ]
      },
      {
        title: "Volume Analysis",
        metrics: [
          {
            label: "OBV",
            value: latest.obv.toLocaleString(),
            type: latest.obv > 0 ? 'positive' : 'negative'
          },
          {
            label: "A/D Line",
            value: latest.ad.toLocaleString(),
            type: latest.ad > 0 ? 'positive' : 'negative'
          },
          {
            label: "Volume",
            value: `${(latest.volume / 1000000).toFixed(2)}M`
          }
        ]
      },
      {
        title: "Momentum",
        metrics: [
          {
            label: "Momentum",
            value: latest.momentum.toFixed(2),
            type: latest.momentum > 0 ? 'positive' : 'negative'
          },
          {
            label: "ROC",
            value: `${latest.roc.toFixed(2)}%`,
            type: latest.roc > 0 ? 'positive' : 'negative'
          },
          {
            label: "NATR",
            value: `${latest.natr.toFixed(2)}%`
          }
        ]
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

  // Add unified card style
  const cardStyle = cn(
    "border border-gray-200 dark:border-gray-700",
    "bg-white/50 dark:bg-gray-800/50",
    "backdrop-blur-sm"
  );

  // Update button styles for metric toggles
  const getButtonStyle = (active: boolean) => cn(
    "dark:text-gray-200",
    active ? "bg-primary-500 dark:bg-primary-600" : "border-gray-200 dark:border-gray-700",
    "hover:bg-primary-600 dark:hover:bg-primary-700",
    "transition-colors duration-200"
  );

  return (
    <div className="space-y-6">
      <StockHeader 
        stockData={stockData}
        analysisText={analysisText}
        shareId={shareId}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2 space-y-4">
          <StockChart 
            stockData={stockData}
            activeMetrics={activeMetrics}
            setActiveMetrics={setActiveMetrics}
            cardStyle={cardStyle}
          />

          {/* Technical Analysis Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Technical Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getTechnicalCards().map((cardData, index) => (
                <MetricCard 
                  key={`tech-${index}`} 
                  data={cardData} 
                  textStyles={textStyles}
                  cardStyle={cardStyle}
                />
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
                <MetricCard 
                  key={`fund-${index}`} 
                  data={cardData} 
                  textStyles={textStyles}
                  cardStyle={cardStyle}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Trading Signal and Analysis */}
        <div className="space-y-4">
          <TradingSignal stockData={stockData} />
          {analysisText && (
            <Card className={cardStyle}>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Analysis</CardTitle>
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