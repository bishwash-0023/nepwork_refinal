'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, removeToken, getUserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            Freelance Platform
          </Link>

          <div className="flex items-center gap-4">
            {mounted && user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="ghost">Jobs</Button>
                </Link>
                {role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost">Admin</Button>
                  </Link>
                )}
                <Badge variant="secondary">{user.name}</Badge>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : mounted ? (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </>
            ) : (
              // Show default state during SSR to prevent hydration mismatch
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

