'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { jobsAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Briefcase, Users, Plus, ArrowRight, Clock } from 'lucide-react';
import useSWR from 'swr';

export default function MyJobsPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const { data, error, isLoading } = useSWR(
        mounted ? '/jobs/my' : null,
        () => jobsAPI.getMyJobs()
    );

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-10 w-48 mb-8" />
                    <div className="grid gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <Skeleton className="h-6 w-1/3 mb-4" />
                                    <Skeleton className="h-4 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const jobs = data?.data?.data || [];

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />

            <div className="bg-primary/5 border-b mb-8">
                <div className="container mx-auto px-4 py-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">My Posted Jobs</h1>
                        <p className="text-muted-foreground italic">Manage your active listings and review applicants.</p>
                    </div>
                    <Link href="/jobs/new">
                        <Button className="rounded-full shadow-lg group">
                            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                            Post New Job
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {error && (
                    <Card className="border-destructive/20 bg-destructive/5 mb-8">
                        <CardContent className="py-4 text-center text-destructive font-medium">
                            Failed to load your jobs. Please try again.
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 max-w-5xl mx-auto">
                    {jobs.map((job) => (
                        <Card key={job.id} className="hover:border-primary/30 transition-all duration-300 hover:shadow-md border-2 border-muted/50 rounded-2xl overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <CardTitle className="text-xl font-bold hover:text-primary transition-colors mb-1">
                                                <Link href={`/my-posts/details/${job.id}`}>{job.title}</Link>
                                            </CardTitle>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3 mr-1" />
                                                <span>Posted on {new Date(job.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <Badge className={`${job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} border-none`}>
                                            {job.status}
                                        </Badge>
                                    </div>

                                    <p className="text-muted-foreground line-clamp-2 text-sm mb-4 leading-relaxed">
                                        {job.description}
                                    </p>

                                    <div className="flex flex-wrap gap-4 pt-4 border-t">
                                        <div className="flex items-center text-sm font-semibold">
                                            <Users className="h-4 w-4 mr-2 text-primary" />
                                            <span>{job.applicant_count || 0} Applications</span>
                                        </div>
                                        <div className="flex items-center text-sm font-semibold text-primary">
                                            <Briefcase className="h-4 w-4 mr-2" />
                                            <span>Budget: ${job.budget}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex md:flex-col justify-center gap-2">
                                    <Link href={`/my-posts/details/${job.id}`} className="flex-1 md:flex-none">
                                        <Button variant="outline" className="w-full rounded-xl">
                                            Job Details
                                        </Button>
                                    </Link>
                                    <Link href={`/my-posts/details/${job.id}`} className="flex-1 md:flex-none">
                                        <Button className="w-full rounded-xl group">
                                            Review Applicants <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {jobs.length === 0 && !isLoading && (
                        <div className="py-20 text-center bg-muted/5 border-2 border-dashed rounded-3xl">
                            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                            <h3 className="text-xl font-bold mb-2">No jobs posted yet</h3>
                            <p className="text-muted-foreground mb-8">Start by posting your first project to find talented freelancers.</p>
                            <Link href="/jobs/new">
                                <Button className="rounded-full shadow-lg">
                                    Post Your First Job
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
