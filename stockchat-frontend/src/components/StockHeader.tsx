import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/util/utils';
import { ShareButton } from '@/components/ShareButton';

interface StockHeaderProps {
  stockData: {
    price: number;
    returns: number;
  }[];
  analysisText: {
    summary: string;
    timestamp: string;
  } | null;
  shareId?: string;
}

export function StockHeader({ stockData, analysisText, shareId }: StockHeaderProps) {
  return (
    <motion.div 
      className="flex justify-between items-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {analysisText?.summary.split(' ')[0]}
          </h2>
          <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
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
  );
} 