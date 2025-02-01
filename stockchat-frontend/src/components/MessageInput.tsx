import React from 'react';
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { cn } from '@/util/utils';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function MessageInput({ message, setMessage, onSubmit }: MessageInputProps) {
  return (
    <motion.form 
      onSubmit={onSubmit} 
      className="flex space-x-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Input
        type="text"
        value={message}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
        placeholder="Ask about any stock or market trend..."
        className={cn(
          "flex-1",
          "bg-white/50 dark:bg-gray-700/50",
          "border-gray-200 dark:border-gray-600",
          "focus:ring-2 focus:ring-primary/50",
          "text-gray-900 dark:text-white",
          "placeholder:text-gray-500 dark:placeholder:text-gray-400",
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
  );
} 