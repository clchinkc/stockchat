import React from 'react';

interface AnalysisTextProps {
  analysisText: {
    summary: string;
    technicalFactors: string[];
    fundamentalFactors: string[];
    outlook: string;
  };
}

export function AnalysisText({ analysisText }: AnalysisTextProps) {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Summary</h3>
        <p className="text-gray-600 dark:text-gray-300">{analysisText.summary}</p>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Technical Analysis</h3>
        {analysisText.technicalFactors.map((factor, index) => (
          <p key={index} className="text-gray-600 dark:text-gray-300 mb-2">
            {factor}
          </p>
        ))}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Fundamental Analysis</h3>
        {analysisText.fundamentalFactors.map((factor, index) => (
          <p key={index} className="text-gray-600 dark:text-gray-300 mb-2">
            {factor}
          </p>
        ))}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Outlook</h3>
        <p className="text-gray-600 dark:text-gray-300">{analysisText.outlook}</p>
      </div>
    </div>
  );
}
