import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  shareId?: string;
}

export function ShareButton({ shareId }: ShareButtonProps) {
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    // You might want to add a toast notification here
    alert('Share link copied to clipboard!');
  };

  return (
    <Button
      onClick={handleShare}
      className="flex items-center space-x-2"
      disabled={!shareId}
    >
      <Share2 className="h-4 w-4" />
      <span>Share Analysis</span>
    </Button>
  );
}
