import { UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';

export function AppFooter() {
  return (
    <footer className="bg-secondary/50 no-print">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Culinary Hub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Culinary Hub. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
