'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, removeToken, getUserRole } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const router = useRouter();
  const [user, setUserState] = useState(null);
  const [role, setRole] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = getUser();
    const userRole = getUserRole();
    setUserState(userData);
    setRole(userRole);
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Freelance Platform
            </span>
          </Link>

          {mounted && user && (
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-sm font-medium">
                  Dashboard
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="ghost" className="text-sm font-medium">
                  Find Jobs
                </Button>
              </Link>
              {role === 'client' && (
                <Link href="/my-jobs">
                  <Button variant="ghost" className="text-sm font-medium">
                    My Jobs
                  </Button>
                </Link>
              )}
              {role === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost" className="text-sm font-medium">
                    Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {mounted && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-muted-foreground/10 hover:border-primary/30 transition-colors">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : mounted ? (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

