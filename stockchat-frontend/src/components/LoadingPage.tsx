import React from 'react';
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingPage() {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <div className="space-y-2 text-center">
        <motion.div
          className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-48"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mx-auto"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-24 mx-auto"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </motion.div>
  );
} 