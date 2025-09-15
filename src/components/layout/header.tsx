
"use client";

import Link from "next/link";
import {
  Bell,
  ChefHat,
  LayoutDashboard,
  LogIn,
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

const navLinks = [
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/map", label: "Food Map", icon: MapPin },
  { href: "/recipes/new", label: "Add Recipe", icon: PlusCircle },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function AppHeader() {
  const pathname = usePathname();

  // A mock auth state. This will be replaced with real authentication logic.
  const isLoggedIn = false;

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
            <div className="mt-8">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-10"
                />
              </div>
              <div className="flex flex-col space-y-2">
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
            </div>
          </SheetContent>
        </Sheet>
        {/* End Mobile Nav */}

        <div className="flex flex-1 items-center justify-between md:justify-end space-x-4">
          <div className="hidden md:flex flex-1 max-w-sm relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Search community, recipes, users..."
                className="w-full pl-10"
              />
          </div>
           {isLoggedIn ? (
            <nav className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                   <div className="space-y-2">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      No new notifications.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
               <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150" alt="User avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </nav>
          ) : (
            <Button asChild variant="ghost" size="icon" aria-label="Login">
              <Link href="/login">
                <LogIn className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
