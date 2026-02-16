'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { jobsAPI, applicationsAPI } from '@/lib/api';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import {
    Users,
    ArrowLeft,
    FileText,
    ChevronRight,
    Clock,
    CircleDollarSign,
    AlertCircle
} from 'lucide-react';
import useSWR from 'swr';

export default function MyPostDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const { data: jobData, isLoading: jobLoading } = useSWR(
        mounted && jobId ? `/jobs/${jobId}/owner` : null,
        () => jobsAPI.getById(jobId)
    );

    const { data: appsData, isLoading: appsLoading } = useSWR(
        mounted && jobId ? `/applications/job/${jobId}` : null,
        () => applicationsAPI.getJobApplications(jobId)
    );

    if (!mounted || jobLoading || appsLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-10 w-64 mb-8" />
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-60 w-full" />
                        </div>
                        <Skeleton className="h-60 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    const job = jobData?.data?.data;
    const applications = appsData?.data?.data || [];

    if (!job) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center mt-20">
                    <AlertCircle className="h-16 w-16 mx-auto text-destructive/20 mb-4" />
                    <h2 className="text-2xl font-bold">Job Not Found</h2>
                    <Button onClick={() => router.push('/my-jobs')} variant="ghost" className="mt-4">
                        Return to My Jobs
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />

            <div className="bg-primary/5 border-b mb-10 py-10">
                <div className="container mx-auto px-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/my-jobs')}
                        className="mb-6 hover:bg-background/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Jobs
                    </Button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex gap-2 items-center mb-1">
                                <Badge variant="secondary">{job.status}</Badge>
                                <span className="text-xs text-muted-foreground font-medium">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{job.title}</h1>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-background px-6 py-3 rounded-2xl shadow-sm border text-center min-w-[120px]">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Budget</p>
                                <p className="text-xl font-extrabold text-primary">${job.budget}</p>
                            </div>
                            <div className="bg-background px-6 py-3 rounded-2xl shadow-sm border text-center min-w-[120px]">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Applicants</p>
                                <p className="text-xl font-extrabold text-blue-600">{applications.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-10">
                    {/* Application List */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold flex items-center mb-6">
                            <Users className="h-6 w-6 mr-3 text-primary" />
                            Applicants
                        </h2>

                        <div className="space-y-4">
                            {applications.length > 0 ? (
                                applications.map((app) => (
                                    <Card key={app.id} className="group hover:border-primary/30 transition-all border-2 border-muted/50 rounded-2xl overflow-hidden cursor-pointer" onClick={() => router.push(`/my-posts/applications/${app.id}`)}>
                                        <div className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-primary/5">
                                                    <AvatarFallback className="bg-primary/5 text-primary">
                                                        {app.applicant_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-bold text-lg leading-none mb-1 group-hover:text-primary transition-colors">{app.applicant_name}</h4>
                                                    <p className="text-sm text-muted-foreground font-medium">{app.applicant_email}</p>
                                                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="hidden sm:block text-right">
                                                    <Badge className="mb-1" variant={app.status === 'pending' ? 'outline' : 'secondary'}>{app.status}</Badge>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="py-20 text-center bg-muted/5 border-2 border-dashed rounded-3xl opacity-50">
                                    <Users className="h-12 w-12 mx-auto mb-4" />
                                    <p className="font-medium">No one has applied for this job yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Job Stats Sidebar */}
                    <div className="space-y-6">
                        <Card className="rounded-3xl border shadow-sm">
                            <CardHeader className="bg-primary/5 border-b py-4">
                                <CardTitle className="text-lg">Job Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Description Highlights</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-4">
                                        {job.description}
                                    </p>
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Status</span>
                                        <Badge>{job.status}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Visibility</span>
                                        <span className="font-bold text-green-600 flex items-center">
                                            <Users className="h-3 w-3 mr-1" /> Public
                                        </span>
                                    </div>
                                </div>

                                <Link href={`/jobs/${job.id}`}>
                                    <Button variant="outline" className="w-full rounded-xl mt-4">
                                        <FileText className="h-4 w-4 mr-2" /> View Public Page
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
