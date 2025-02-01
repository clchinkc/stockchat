import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from 'react-router-dom';
import ApiClient from '@/util/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/util/theme';
import { cn } from '@/util/utils';
import { Header } from '@/components/Header';
import { LandingPage } from '@/components/LandingPage';
import { LoadingPage } from '@/components/LoadingPage';
import { ResultPage } from '@/components/ResultPage';
import { MessageInput } from '@/components/MessageInput';
import { Container } from "@/components/ui/container";

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

interface AnalysisTextProps {
  analysisText: AnalysisText;
}

function AnalysisText({ analysisText }: AnalysisTextProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{analysisText.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {analysisText.technicalFactors.map((factor: string, index: number) => (
            <p key={index} className="text-muted-foreground">
              {factor}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fundamental Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {analysisText.fundamentalFactors.map((factor: string, index: number) => (
            <p key={index} className="text-muted-foreground">
              {factor}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outlook</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{analysisText.outlook}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  const [message, setMessage] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [analysisText, setAnalysisText] = useState<AnalysisText | null>(null);
  const [shareId, setShareId] = useState<string | undefined>();
  const [activeMetrics, setActiveMetrics] = useState({
    price: true,
    ma20: false,
    ma50: false,
    ma200: false,
    returns: false
  });
  const [stats, setStats] = useState<any>(null);
  
  const location = useLocation();
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []); // Only run once on mount

  useEffect(() => {
    // Share link effect
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'share' && pathParts[2]) {
      loadSharedAnalysis(pathParts[2]);
    }
  }, [location]);

  const loadSharedAnalysis = async (analysisId: string) => {
    try {
      const data = await ApiClient.getSharedAnalysis(analysisId);
      setStockData(data.stockData);
      setAnalysisText(data.analysisText);
      setStats(data.stats);
      setShareId(analysisId);
      setShowResult(true);
    } catch (error) {
      console.error('Error loading shared analysis:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const data = await ApiClient.analyzeStock(message);
      setStockData(data.stockData);
      setAnalysisText(data.analysisText);
      setStats(data.stats);
      setShareId(data.shareId);
      setShowResult(true);
    } catch (error) {
      console.error('Error analyzing stock:', error);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const handleLogoClick = () => {
    setShowResult(false);
    setMessage('');
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "bg-gray-900" : "bg-gray-100"
    )}>
      <Header onLogoClick={handleLogoClick} />

      <Container>
        <Card className={cn(
          "backdrop-blur-xl transition-colors duration-300",
          isDarkMode 
            ? "bg-gray-800/90 border-gray-700" 
            : "bg-white/90 border-gray-200",
          "shadow-lg"
        )}>
          <CardContent className="p-6">
            <ScrollArea className="h-[calc(100vh-300px)] mb-6">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <PageTransition>
                    <LoadingPage />
                  </PageTransition>
                ) : showResult ? (
                  <PageTransition>
                    <ResultPage 
                      stockData={stockData} 
                      analysisText={analysisText} 
                      shareId={shareId}
                      stats={stats}
                    />
                  </PageTransition>
                ) : (
                  <PageTransition>
                    <LandingPage onExampleClick={setMessage} />
                  </PageTransition>
                )}
              </AnimatePresence>
            </ScrollArea>

            <MessageInput 
              message={message}
              setMessage={setMessage}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

// Helper component for page transitions
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default App;
