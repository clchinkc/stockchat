import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/util/utils';

interface MetricCardProps {
  data: {
    title: string;
    metrics: {
      label: string;
      value: string | number;
      type?: 'positive' | 'negative' | 'neutral';
    }[];
  };
  textStyles: {
    title: string;
    label: string;
    value: string;
    positive: string;
    negative: string;
    neutral: string;
  };
  cardStyle: string;
}

export function MetricCard({ data, textStyles, cardStyle }: MetricCardProps) {
  // Update metric card colors
  const getMetricColor = (value: number | string, type?: 'positive' | 'negative' | 'neutral'): string => {
    if (type === 'positive') return textStyles.positive;
    if (type === 'negative') return textStyles.negative;
    if (type === 'neutral') return textStyles.neutral;
    
    if (typeof value === 'number') {
      if (value > 0) return textStyles.positive;
      if (value < 0) return textStyles.negative;
    }
    return "text-gray-900 dark:text-white";
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={cn(
        cardStyle,
        "h-[180px]",
        "shadow-sm hover:shadow-md transition-shadow"
      )}>
        <CardContent className="pt-3">
          <div className="text-center">
            <h3 className={cn(textStyles.title, "mb-2")}>{data.title}</h3>
            <div className="space-y-1.5">
              {data.metrics.map((metric, idx) => (
                <div key={idx} className="flex justify-between items-center px-2">
                  <p className={cn(textStyles.label)}>{metric.label}</p>
                  <p className={cn(
                    "text-sm font-semibold",
                    metric.type ? getMetricColor(metric.value, metric.type) : "text-gray-900 dark:text-white"
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
} 