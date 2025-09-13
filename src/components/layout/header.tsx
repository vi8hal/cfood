"use client";

import Link from "next/link";
import {
  Bell,
  ChefHat,
  MapPin,
  Menu,
  PlusCircle,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import placeholderImages from "@/lib/placeholder-images.json";

const navLinks = [
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/map", label: "Food Map", icon: MapPin },
  { href: "/recipes/new", label: "Add Recipe", icon: PlusCircle },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              Culinary Hub
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-4"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>
                <Link href="/" className="flex items-center space-x-2">
                  <UtensilsCrossed className="h-6 w-6 text-primary" />
                  <span className="font-bold font-headline">Culinary Hub</span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        {/* End Mobile Nav */}

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can be a global search component */}
          </div>
          <nav className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Recent updates and sales.
                    </p>
                  </div>
                  <Separator />
                  <div className="grid gap-2">
                    <div className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent">
                      <Avatar className="mt-px h-8 w-8">
                        <AvatarImage
                          src={(placeholderImages.recipes as any)['1'].src}
                          alt={(placeholderImages.recipes as any)['1'].alt}
                          data-ai-hint={(placeholderImages.recipes as any)['1'].hint}
                        />
                        <AvatarFallback>SP</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Sale Alert!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tony&apos;s Pasta Place is now offering Spicy Tomato
                          Pasta for pickup!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </nav>
        </div>
      </div>
    </header>
  );
}
