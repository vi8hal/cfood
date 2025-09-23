'use client';

import Link from 'next/link';
import {
  Bell,
  ChefHat,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  Search,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar';
import {usePathname} from 'next/navigation';
import {cn} from '@/lib/utils';
import {Input} from '../ui/input';
import {useEffect, useState} from 'react';
import {signOutAction} from '@/lib/actions';
import { getSession } from '@/lib/auth';
import type { User as UserType } from '@/lib/types';


const navLinks = [
  {href: '/recipes', label: 'Recipes', icon: ChefHat},
  {href: '/map', label: 'Food Map', icon: MapPin},
];

const authenticatedNavLinks = [
  {href: '/recipes/new', label: 'Add Recipe', icon: PlusCircle},
  {href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
];

type Session = { user: UserType } | null;

export function AppHeader() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // This is a server function, but we can call it in a client component's useEffect
        const sessionData = await getSession();
        setSession(sessionData as Session);
      } catch (error) {
        console.error('Session check failed', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [pathname]); // Re-check session on path change

  const allNavLinks = session?.user
    ? [...navLinks, ...authenticatedNavLinks]
    : navLinks;

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
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
            {session?.user &&
              authenticatedNavLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'transition-colors hover:text-primary',
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-foreground/60'
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
                {allNavLinks.map(link => (
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
          {isLoading ? (
            <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                  >
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage
                        src={
                          session.user.image || undefined
                        }
                        alt="User avatar"
                      />
                      <AvatarFallback>
                        {session.user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email || 'user@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={signOutAction} className="w-full">
                    <DropdownMenuItem asChild>
                      <button type="submit" className="w-full">
                        <LogOut className="mr-2" />
                        Sign Out
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2" /> Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
