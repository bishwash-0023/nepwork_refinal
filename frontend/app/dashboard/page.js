'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, getUserRole } from '@/lib/auth';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useSWR from 'swr';
import { jobsAPI } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(getUser());
    setRole(getUserRole());
  }, [router]);

  const { data: jobsData, error } = useSWR(
    role === 'client' ? ['/jobs', { client_id: user?.id }] : '/jobs',
    () => {
      if (role === 'client') {
        return jobsAPI.getAll({ client_id: user?.id });
      }
      return jobsAPI.getAll({ status: 'open' });
    }
  );

  if (!user || !role) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
          <p className="text-gray-600">Role: {role}</p>
        </div>

        {role === 'client' && (
          <div className="mb-6">
            <Link href="/jobs/new">
              <Button>Post New Job</Button>
            </Link>
          </div>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {role === 'client' ? 'My Jobs' : 'Available Jobs'}
              </CardTitle>
              <CardDescription>
                {role === 'client'
                  ? 'Jobs you have posted'
                  : 'Browse available jobs and submit proposals'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && <p className="text-destructive">Error loading jobs</p>}
              {jobsData?.data?.data?.jobs?.length === 0 && (
                <p className="text-gray-500">No jobs found</p>
              )}
              {jobsData?.data?.data?.jobs?.map((job) => (
                <div key={job.id} className="border-b py-4 last:border-0">
                  <Link href={`/jobs/${job.id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary">
                      {job.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Budget: ${job.budget}</span>
                    <span>Status: {job.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

