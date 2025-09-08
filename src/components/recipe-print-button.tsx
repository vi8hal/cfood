"use client";

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function RecipePrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button onClick={handlePrint} className="w-full no-print">
      <Printer className="mr-2 h-4 w-4" /> Print Recipe
    </Button>
  );
}
