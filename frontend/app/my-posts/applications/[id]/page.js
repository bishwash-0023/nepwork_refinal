'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { applicationsAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import {
    FileText,
    Download,
    ArrowLeft,
    DownloadIcon,
    ExternalLink,
    ShieldCheck,
    User,
    Mail,
    Calendar,
    Layers,
    FileCheck
} from 'lucide-react';
import useSWR from 'swr';

export default function DeepApplicationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const applicationId = params.id;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const { data, error, isLoading } = useSWR(
        mounted && applicationId ? `/applications/${applicationId}` : null,
        () => applicationsAPI.getById(applicationId)
    );

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-[400px] w-full rounded-3xl" />
                </div>
            </div>
        );
    }

    const app = data?.data?.data;

    if (!app) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <FileText className="h-20 w-20 mx-auto text-muted-foreground/20 mb-4" />
                    <h2 className="text-2xl font-bold">Application Not Found</h2>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </div>
        );
    }

    const getDocUrl = (path) => {
        if (!path) return '#';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5135';
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${apiUrl}/${cleanPath}`;
    };

    const getDocInfo = (path) => {
        if (!path) return { label: 'Not provided', sub: 'No file', icon: <FileText />, color: 'bg-muted', text: 'text-muted-foreground' };
        const ext = path.split('.').pop().toLowerCase();
        if (ext === 'pdf') {
            return { label: 'PDF Document', sub: 'Portable Document Format', icon: <FileText />, color: 'bg-red-100', text: 'text-red-600' };
        }
        if (['doc', 'docx'].includes(ext)) {
            return { label: 'Word Document', sub: 'Microsoft Word Format', icon: <FileText />, color: 'bg-blue-100', text: 'text-blue-600' };
        }
        return { label: 'Document', sub: ext.toUpperCase() + ' File', icon: <FileText />, color: 'bg-primary/10', text: 'text-primary' };
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />

            <div className="bg-primary/5 border-b mb-10 py-10">
                <div className="container mx-auto px-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-6 hover:bg-background/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to job dashboard
                    </Button>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                        <div className="flex gap-6 items-center flex-1">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                                    {app.applicant_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                                    {app.applicant_name}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-muted-foreground font-medium">
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-primary" />
                                        <span>{app.applicant_email}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                                        <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <Badge className="px-4 py-1 text-lg" variant="secondary">{app.status}</Badge>
                            <p className="text-sm text-muted-foreground uppercase font-bold">Ref: APP-{app.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-10">
                    {/* Detailed Application Information */}
                    <div className="md:col-span-2 space-y-8 animate-fade-in">
                        <section className="bg-background p-8 rounded-3xl border shadow-sm space-y-6">
                            <h3 className="text-2xl font-bold border-b pb-4 flex items-center">
                                <FileText className="h-6 w-6 mr-3 text-primary" />
                                Cover Letter
                            </h3>
                            <div className="prose prose-blue max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {app.cover_letter || "No cover letter provided."}
                            </div>
                        </section>

                        {app.additional_info && (
                            <section className="bg-background p-8 rounded-3xl border shadow-sm space-y-6">
                                <h3 className="text-2xl font-bold border-b pb-4 flex items-center">
                                    <Layers className="h-6 w-6 mr-3 text-primary" />
                                    Additional Information
                                </h3>
                                <div className="prose prose-blue max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {app.additional_info}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Files & Documents Sidebar */}
                    <div className="space-y-6 animate-slide-in-right">
                        <Card className="rounded-3xl border-2 border-primary/20 bg-primary/5 shadow-lg overflow-hidden">
                            <CardHeader className="py-4 border-b bg-primary/5">
                                <CardTitle className="text-lg">Candidate Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {[
                                    { path: app.resume_path, title: 'Resume / CV', defaultSub: 'PDF Document' },
                                    { path: app.biodata_path, title: 'Biodata', defaultSub: 'Personal Information' },
                                    { path: app.eligibility_path, title: 'Eligibility', defaultSub: 'Qualification Papers' }
                                ].map((doc, idx) => {
                                    const info = getDocInfo(doc.path);
                                    return (
                                        <div key={idx} className="group bg-background p-4 rounded-2xl border flex items-center justify-between hover:border-primary/50 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 ${info.color} ${info.text} rounded-xl flex items-center justify-center`}>
                                                    {info.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{doc.title}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{info.sub}</p>
                                                </div>
                                            </div>
                                            {doc.path ? (
                                                <a
                                                    href={getDocUrl(doc.path)}
                                                    target="_blank"
                                                    download
                                                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground italic">Not provided</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border shadow-sm overflow-hidden">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 text-sm text-green-600 font-bold">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span>Qualified Applicant</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    This applicant has passed initial verification and is eligible for hire on this platform.
                                </p>
                                <Button className="w-full rounded-xl shadow-glow">
                                    Schedule Interview
                                </Button>
                                <Button variant="outline" className="w-full rounded-xl">
                                    Reject Application
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
