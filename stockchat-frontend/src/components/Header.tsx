import React from 'react';
import { TrendingUp, Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useThemeStore } from '@/util/theme';
import { cn } from '@/util/utils';

interface HeaderProps {
  onLogoClick: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <header className="border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button 
          onClick={onLogoClick}
          className={cn(
            "flex items-center space-x-2",
            "text-2xl font-bold",
            "hover:opacity-80 transition-opacity",
            "bg-transparent border-none p-0 cursor-pointer",
            isDarkMode ? "text-white" : "text-gray-900"
          )}
        >
          <TrendingUp className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <span>StockChat</span>
        </button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
} 