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

import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';

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

  if (!mounted || !authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <Skeleton className="h-[200px] w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const jobs = data?.data?.data?.jobs || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Search Header */}
      <div className="bg-primary/5 border-b mb-8">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 animate-fade-in">
            Find Your Next <span className="text-primary tracking-tight">Opportunity</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 animate-fade-in animation-delay-200">
            Browse through hundreds of high-quality freelancing jobs and projects across the globe.
          </p>

          <div className="max-w-2xl mx-auto relative animate-fade-in-up animation-delay-400">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search for projects, tasks, or roles..."
                className="w-full h-14 pl-11 pr-4 rounded-xl border-2 border-primary/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-background shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-2 border-muted/50 rounded-xl">
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  <Skeleton className="h-32 w-full md:w-48 rounded-lg" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="py-8 text-center text-destructive">
              Error fetching jobs. Please try refreshing the page.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {jobs.map((job) => (
              <Card key={job.id} className="group hover:border-primary/30 transition-all duration-300 hover:shadow-xl border-2 border-muted/50 rounded-xl overflow-hidden animate-fade-in-up">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-60 h-48 md:h-auto bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden flex items-center justify-center">
                    {job.image_path ? (
                      <img
                        src={job.image_path.startsWith('http')
                          ? job.image_path
                          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5135'}/${job.image_path.startsWith('/') ? job.image_path.substring(1) : job.image_path}`}
                        alt={job.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="flex flex-col items-center justify-center text-muted-foreground/30"
                      style={{ display: job.image_path ? 'none' : 'flex' }}
                    >
                      <Briefcase className="h-10 w-10 mb-1" />
                      <span className="text-[10px] uppercase font-bold tracking-tighter">No Preview</span>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90" variant="outline">
                      {job.status}
                    </Badge>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                          <CardTitle className="text-xl font-bold leading-tight group-hover:underline">
                            {job.title}
                          </CardTitle>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary uppercase">
                            {job.client_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground font-medium">
                          {job.client_name}
                        </span>
                        <span className="text-muted-foreground/30">•</span>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Recently posted</span>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-6 line-clamp-2 text-sm leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-muted">
                      <div className="flex gap-4">
                        <div className="flex items-center text-primary font-bold">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-lg">{job.budget}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>Remote</span>
                        </div>
                      </div>

                      <Link href={`/jobs/${job.id}`}>
                        <Button className="rounded-full px-6 shadow-glow hover:scale-105 transition-transform" size="sm">
                          View details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {jobs.length === 0 && (
              <Card className="border-dashed border-2 bg-muted/5 py-20 text-center">
                <div className="max-w-xs mx-auto space-y-4">
                  <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-xl font-semibold">No jobs found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search keywords to find what you are looking for.
                  </p>
                  <Button variant="outline" className="rounded-full">
                    Reset Search
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
