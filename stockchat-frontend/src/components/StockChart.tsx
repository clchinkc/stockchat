import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/util/utils';
import { useThemeStore } from '@/util/theme';

interface StockData {
  date: string;
  price: number;
  returns: number;
  ma20: number;
  ma50: number;
  ma200: number;
  volume: number;
  rsi: number;
  macd: number;
  macd_signal: number;
  bb_upper: number;
  bb_lower: number;
}

interface StockChartProps {
  stockData: StockData[];
  activeMetrics: {
    price: boolean;
    ma20: boolean;
    ma50: boolean;
    ma200: boolean;
    returns: boolean;
  };
  setActiveMetrics: React.Dispatch<React.SetStateAction<{
    price: boolean;
    ma20: boolean;
    ma50: boolean;
    ma200: boolean;
    returns: boolean;
  }>>;
  cardStyle: string;
}

export function StockChart({ stockData, activeMetrics, setActiveMetrics, cardStyle }: StockChartProps) {
  const { isDarkMode } = useThemeStore();

  const chartColors = {
    price: isDarkMode ? "#a78bfa" : "#7c3aed", // Purple for price
    ma20: "#22c55e", // Green-500
    ma50: "#eab308", // Yellow-500
    ma200: "#ef4444", // Red-500
    returns: isDarkMode ? "#93c5fd" : "#2563eb" // Blue for returns
  };

  const formatXAxis = (tickItem: string) => {
    return new Date(tickItem).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getButtonStyle = (active: boolean) => cn(
    "dark:text-gray-200",
    active ? "bg-primary-500 dark:bg-primary-600" : "border-gray-200 dark:border-gray-700",
    "hover:bg-primary-600 dark:hover:bg-primary-700",
    "transition-colors duration-200"
  );

  return (
    <Card className={cn(cardStyle, "p-4")}>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          size="sm"
          variant={activeMetrics.price ? "default" : "outline"}
          onClick={() => setActiveMetrics(m => ({ ...m, price: !m.price }))}
          className={getButtonStyle(activeMetrics.price)}
        >
          Price
        </Button>
        <Button 
          size="sm"
          variant={activeMetrics.ma20 ? "default" : "outline"}
          onClick={() => setActiveMetrics(m => ({ ...m, ma20: !m.ma20 }))}
          className={getButtonStyle(activeMetrics.ma20)}
        >
          20-Day MA
        </Button>
        <Button 
          size="sm"
          variant={activeMetrics.ma50 ? "default" : "outline"}
          onClick={() => setActiveMetrics(m => ({ ...m, ma50: !m.ma50 }))}
          className={getButtonStyle(activeMetrics.ma50)}
        >
          50-Day MA
        </Button>
        <Button 
          size="sm"
          variant={activeMetrics.ma200 ? "default" : "outline"}
          onClick={() => setActiveMetrics(m => ({ ...m, ma200: !m.ma200 }))}
          className={getButtonStyle(activeMetrics.ma200)}
        >
          200-Day MA
        </Button>
        <Button 
          size="sm"
          variant={activeMetrics.returns ? "default" : "outline"}
          onClick={() => setActiveMetrics(m => ({ ...m, returns: !m.returns }))}
          className={getButtonStyle(activeMetrics.returns)}
        >
          Returns
        </Button>
      </div>
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
  );
} 