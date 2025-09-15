"use client";

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bookmark } from 'lucide-react';
import { useState } from 'react';

export default function SaveRecipeButton() {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsSaved(!isSaved);
    setIsLoading(false);
    toast({
      title: isSaved ? "Recipe Unsaved" : "Recipe Saved!",
      description: isSaved ? "This recipe has been removed from your favorites." : "You can find this recipe in your dashboard.",
    });
  };

  return (
    <Button onClick={handleSave} disabled={isLoading} className="w-full no-print">
      <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      {isSaved ? 'Saved' : 'Save Recipe'}
    </Button>
  );
}
