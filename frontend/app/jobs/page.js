'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useSWR from 'swr';
import { jobsAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

export default function JobsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const authStatus = isAuthenticated();
    setAuthenticated(authStatus);
    
    if (!authStatus) {
      router.push('/login');
    }
  }, [router]);

  const { data, error, isLoading } = useSWR(
    authenticated ? '/jobs' : null,
    () => jobsAPI.getAll({ status: 'open' })
  );

  // Show loading state during hydration
  if (!mounted || !authenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Available Jobs</h1>
        </div>

        {isLoading && <p>Loading jobs...</p>}
        {error && <p className="text-destructive">Error loading jobs</p>}

        <div className="grid gap-4">
          {data?.data?.data?.jobs?.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {job.image_path && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={job.image_path.startsWith('http') ? job.image_path : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5135'}/api/${job.image_path}`}
                    alt={job.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      <Link href={`/jobs/${job.id}`} className="hover:text-primary">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>Posted by {job.client_name}</CardDescription>
                  </div>
                  <Badge>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">
                    Budget: ${job.budget}
                  </span>
                  <Link href={`/jobs/${job.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {data?.data?.data?.jobs?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No jobs available at the moment
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

