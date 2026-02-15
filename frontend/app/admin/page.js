'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, hasRole } from '@/lib/auth';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';
import useSWR from 'swr';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
    const authStatus = isAuthenticated() && hasRole('admin');
    setAuthorized(authStatus);
    
    if (!authStatus) {
      router.push('/dashboard');
    }
  }, [router]);

  const { data: usersData, mutate: mutateUsers } = useSWR(
    '/admin/users',
    () => adminAPI.getUsers()
  );

  const { data: jobsData, mutate: mutateJobs } = useSWR(
    '/admin/jobs',
    () => adminAPI.getAllJobs()
  );

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      mutateUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await adminAPI.deleteJob(jobId);
      toast.success('Job deleted successfully');
      mutateJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  if (!mounted || !authorized) {
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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Users ({usersData?.data?.data?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {usersData?.data?.data?.users?.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center border-b py-2"
                  >
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email} - {user.role}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jobsData?.data?.data?.map((job) => (
                  <div
                    key={job.id}
                    className="flex justify-between items-center border-b py-2"
                  >
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-sm text-gray-500">
                        {job.client_name} - ${job.budget} - {job.status}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

