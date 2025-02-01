import React from 'react';
import { cn } from '@/util/utils';
import { AlertCircle, ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface TradingSignalProps {
  stockData: {
    price: number;
    ma20: number;
    ma50: number;
    ma200: number;
  }[];
}

export function TradingSignal({ stockData }: TradingSignalProps) {
    const getSignal = () => {
        const latest = stockData[stockData.length - 1];
        const { price, ma20, ma50, ma200 } = latest;
    
        // Count how many MAs the price is above
        let aboveCount = 0;
        if (price > ma20) aboveCount++;
        if (price > ma50) aboveCount++;
        if (price > ma200) aboveCount++;
    
        // Determine signal based on MA crossovers
        if (aboveCount === 3) {
          return {
            signal: 'Strong Buy',
            rationale: 'Price above all moving averages',
            color: 'bg-green-500',
            icon: ArrowUp,
            confidence: 90
          };
        } else if (aboveCount === 2) {
          return {
            signal: 'Buy',
            rationale: 'Price above majority of moving averages',
            color: 'bg-green-400',
            icon: ArrowUp,
            confidence: 70
          };
        } else if (aboveCount === 1) {
          return {
            signal: 'Hold',
            rationale: 'Mixed signals from moving averages',
            color: 'bg-yellow-500',
            icon: Minus,
            confidence: 50
          };
        } else if (price < ma20 && ma20 < ma50) {
          return {
            signal: 'Strong Sell',
            rationale: 'Price below all moving averages',
            color: 'bg-red-500',
            icon: ArrowDown,
            confidence: 90
          };
        } else {
          return {
            signal: 'Sell',
            rationale: 'Price below majority of moving averages',
            color: 'bg-red-400',
            icon: ArrowDown,
            confidence: 70
          };
        }
      };
    
      const signal = getSignal();
    
      return (
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "p-2 rounded-full text-white",
              signal.color
            )}>
              <signal.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {signal.signal}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {signal.rationale}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {signal.confidence}% Confidence
            </span>
          </div>
        </div>
      );
    } 