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
import {
  Briefcase,
  Clock,
  DollarSign,
  ShieldCheck,
  Search,
  Plus,
  MessageSquare,
  User,
  ArrowRight,
  TrendingUp,
  Users,
  Layers,
  MapPin
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-slide-in-left">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{user.name}</span>
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase tracking-widest text-[10px]">
                {role}
              </Badge>
              • Your daily overview and active projects
            </p>
          </div>

          <div className="flex items-center gap-3">
            {role === 'client' ? (
              <Link href="/jobs/new">
                <Button className="rounded-2xl h-12 px-8 shadow-glow font-bold text-lg group">
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Post New Job
                </Button>
              </Link>
            ) : (
              <Link href="/jobs">
                <Button className="rounded-2xl h-12 px-8 shadow-glow font-bold text-lg group">
                  <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Find Projects
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in animation-delay-300">
          <StatCard
            icon={<Briefcase className="h-6 w-6" />}
            label={role === 'client' ? "Active Posts" : "Applications"}
            value={jobsData?.data?.data?.jobs?.length || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            label="Hours Logged"
            value="0h"
            color="bg-purple-500"
          />
          {/* <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Balance"
            value="$0.00"
            color="bg-green-500"
          /> */}
          <StatCard
            icon={<ShieldCheck className="h-6 w-6" />}
            label="Success Rate"
            value="98%"
            color="bg-orange-500"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Work / Jobs List */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up animation-delay-500">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {role === 'client' ? <Users className="h-6 w-6 text-primary" /> : <Layers className="h-6 w-6 text-primary" />}
                {role === 'client' ? 'Recent Job Posts' : 'Recommended Projects'}
              </h2>
              <Link href={role === 'client' ? "/my-jobs" : "/jobs"} className="text-primary text-sm font-bold hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {error && (
                <Card className="border-destructive/20 bg-destructive/5 p-6 rounded-3xl text-center">
                  <p className="text-destructive font-medium">Unable to load dashboard data. Please try again.</p>
                </Card>
              )}

              {!jobsData && !error && (
                [1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full rounded-3xl" />
                ))
              )}

              {jobsData?.data?.data?.jobs?.length === 0 && (
                <div className="py-20 text-center bg-muted/5 border-2 border-dashed rounded-3xl">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground">No active {role === 'client' ? 'posts' : 'projects'} to show.</p>
                </div>
              )}

              {jobsData?.data?.data?.jobs?.map((job) => (
                <Link href={`/jobs/${job.id}`} key={job.id}>
                  <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-xl border-2 border-muted/50 rounded-3xl overflow-hidden glass-card">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row gap-6 p-6">
                        <div className="h-24 w-full md:w-32 bg-muted rounded-2xl flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                          {job.image_path ? (
                            <img
                              src={job.image_path.startsWith('http')
                                ? job.image_path
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5135'}/${job.image_path.startsWith('/') ? job.image_path.substring(1) : job.image_path}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              alt=""
                            />
                          ) : (
                            <div className="bg-gradient-to-br from-primary/10 to-primary/5 w-full h-full flex items-center justify-center">
                              <Briefcase className="h-8 w-8 text-primary/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{job.title}</h3>
                            <Badge variant="secondary" className="bg-background/80 uppercase text-[10px] tracking-widest">{job.status}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs font-bold pt-2">
                            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                              <DollarSign className="h-3 w-3" /> {job.budget}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                              <MapPin className="h-3 w-3" /> Remote
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity / Sidebar */}
          <div className="space-y-8 animate-fade-in animation-delay-700">
            <Card className="rounded-3xl border shadow-lg overflow-hidden glass-card border-primary/10">
              <CardHeader className="bg-primary/5 border-b pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <QuickAction icon={<Search className="h-4 w-4" />} label="Browse New Jobs" href="/jobs" />
                <QuickAction icon={<MessageSquare className="h-4 w-4" />} label="Questions" href="/my-jobs/questions" />
                <QuickAction icon={<User className="h-4 w-4" />} label="Update Profile" href="/profile" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <Card className="rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 glass-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ icon, label, href }) {
  return (
    <Link href={href}>
      <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 transition-all text-sm font-bold group border border-transparent hover:border-primary/20">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <span>{label}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
      </div>
    </Link>
  );
}

