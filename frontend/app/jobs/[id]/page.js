'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { jobsAPI, proposalsAPI, messagesAPI, applicationsAPI } from '@/lib/api';
import useSWR from 'swr';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { FileUpload } from '@/components/ui/file-upload';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  ShieldCheck,
  MessageSquare,
  Briefcase,
  User,
  Clock,
  Send,
  FileText,
  UserCheck,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';

import Link from 'next/link';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  const [role, setRole] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showAppForm, setShowAppForm] = useState(false);
  const [appData, setAppData] = useState({
    resume_path: '',
    eligibility_path: '',
    biodata_path: '',
    cover_letter: '',
    additional_info: ''
  });

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setRole(getUserRole());
    }
  }, [router]);

  const { data: jobData, mutate: mutateJob, isLoading } = useSWR(
    jobId ? `/jobs/${jobId}` : null,
    () => jobsAPI.getById(jobId)
  );

  const { data: appsData, mutate: mutateApps } = useSWR(
    role === 'client' && jobId ? `/applications/job/${jobId}` : null,
    () => applicationsAPI.getJobApplications(jobId)
  );

  const { data: messagesData, mutate: mutateMessages } = useSWR(
    mounted && role === 'client' && jobId ? `/jobs/${jobId}/messages` : null,
    () => messagesAPI.getJobMessages(jobId)
  );

  const job = jobData?.data?.data;

  // Show loading during hydration
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    if (!appData.resume_path) {
      toast.error('Please upload your resume');
      return;
    }

    try {
      await applicationsAPI.create({
        job_id: parseInt(jobId),
        ...appData,
      });
      toast.success('Application submitted successfully!');
      setShowAppForm(false);
      setAppData({
        resume_path: '',
        eligibility_path: '',
        biodata_path: '',
        cover_letter: '',
        additional_info: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-muted/10 border-2 border-dashed rounded-3xl py-20">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-6">The job you are looking for does not exist or has been removed.</p>
            <Button onClick={() => router.push('/jobs')} variant="outline" className="rounded-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    // Ensure path starts correctly
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5135';

    // Static files are served from the root, not /api/
    return `${apiUrl}/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Hero Section */}
      <div className="relative border-b overflow-hidden bg-primary/5 py-12 mb-10">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/jobs')}
            className="mb-8 hover:bg-background/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to listings
          </Button>

          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3 space-y-6 animate-slide-in-left">
              <div className="flex gap-2 mb-2">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3">{job.status}</Badge>
                <Badge variant="outline" className="bg-background/50 border-primary/20">Remote</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-medium">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  <span>By {job.client_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <span>Posted recently</span>
                </div>
                <div className="flex items-center font-bold text-foreground bg-background px-4 py-2 rounded-xl shadow-sm border">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-xl">{job.budget}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 animate-scale-in">
              <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-background rotate-1 flex items-center justify-center relative">
                {job.image_path ? (
                  <img
                    src={getImageUrl(job.image_path)}
                    alt={job.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="flex flex-col items-center justify-center text-primary/20"
                  style={{ display: job.image_path ? 'none' : 'flex' }}
                >
                  <Briefcase className="h-20 w-20 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">Project Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8 animate-fade-in animation-delay-400">
            <section className="bg-background p-8 rounded-3xl border shadow-sm">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b">Project Description</h3>
              <div className="prose prose-blue max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </section>

            {/* Messages Section */}
            <section className="bg-muted/5 p-8 rounded-3xl border border-dashed">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-primary" />
                  Messages
                </h3>
                <Badge variant="outline" className="rounded-full">{messagesData?.data?.data?.length || 0}</Badge>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {messagesData?.data?.data?.length > 0 ? (
                  messagesData.data.data.map((message) => (
                    <div key={message.id} className={`p-5 rounded-2xl border bg-background transition-all hover:border-primary/20 ${message.sender_name === job.client_name ? 'ml-4 bg-muted/20' : 'mr-4'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold flex items-center text-sm">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] mr-2">
                            {message.sender_name?.charAt(0)}
                          </div>
                          {message.sender_name}
                        </span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {message.created_at}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{message.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-50 space-y-3">
                    <MessageSquare className="h-10 w-10 mx-auto" />
                    <p>No messages yet. Proposals often trigger discussions.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-slide-in-right animation-delay-600">
            {role === 'freelancer' && job.status === 'open' && (
              <Card className="rounded-3xl border-2 border-primary/20 bg-primary/5 shadow-lg overflow-hidden">
                <CardHeader className="bg-primary/5 border-b py-4">
                  <CardTitle className="text-xl font-extrabold text-primary">
                    {job.my_application ? 'Application Status' : 'Apply Now'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {job.my_application && !showAppForm ? (
                    <div className="space-y-6 text-center py-4">
                      <div className={`h-20 w-20 rounded-2xl shadow-sm border flex items-center justify-center mx-auto mb-4 
                        ${job.my_application.status === 'accepted' ? 'bg-green-100 text-green-600' :
                          job.my_application.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {job.my_application.status === 'accepted' ? <UserCheck className="h-10 w-10" /> :
                          job.my_application.status === 'rejected' ? <AlertCircle className="h-10 w-10" /> : <Clock className="h-10 w-10" />}
                      </div>

                      <div>
                        <Badge className={`mb-2 px-3 py-1 text-sm font-bold uppercase ${job.my_application.status === 'accepted' ? 'bg-green-500' :
                          job.my_application.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                          }`}>
                          {job.my_application.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2 px-4">
                          {job.my_application.status === 'pending' && "Your application is currently being reviewed by the client."}
                          {job.my_application.status === 'accepted' && "Congratulations! Your application has been accepted. The client will contact you soon."}
                          {job.my_application.status === 'rejected' && "Your application was not selected for this role."}
                        </p>
                      </div>

                      {job.my_application.feedback && (
                        <div className="bg-background/80 p-4 rounded-2xl border text-left space-y-2">
                          <p className="text-xs font-bold uppercase text-muted-foreground">Feedback from Client</p>
                          <p className="text-sm italic">"{job.my_application.feedback}"</p>
                        </div>
                      )}

                      {job.my_application.status === 'rejected' && job.my_application.allow_reapply === 1 && (
                        <Button onClick={() => setShowAppForm(true)} className="w-full rounded-2xl py-6 shadow-glow font-bold mt-4">
                          Re-apply for this Job
                        </Button>
                      )}
                    </div>
                  ) : !showAppForm ? (
                    <div className="space-y-4 text-center py-4">
                      <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mb-6">Submit your formal application including resume, biodata and eligibility papers.</p>
                      <Button onClick={() => setShowAppForm(true)} className="w-full rounded-2xl py-7 shadow-glow text-lg font-bold group">
                        Apply for this Job <ArrowLeft className="h-5 w-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitApplication} className="space-y-6">
                      <div className="space-y-4">
                        <FileUpload
                          label="Resume / CV (Required)"
                          onFileUploaded={(path) => setAppData(prev => ({ ...prev, resume_path: path }))}
                          currentFile={appData.resume_path}
                        />
                        <FileUpload
                          label="Biodata"
                          onFileUploaded={(path) => setAppData(prev => ({ ...prev, biodata_path: path }))}
                          currentFile={appData.biodata_path}
                        />
                        <FileUpload
                          label="Eligibility Papers"
                          onFileUploaded={(path) => setAppData(prev => ({ ...prev, eligibility_path: path }))}
                          currentFile={appData.eligibility_path}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold mb-2 block flex items-center gap-2">
                          <Send className="h-4 w-4" /> Cover Letter
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm outline-none bg-background min-h-[120px] text-sm"
                          placeholder="Why are you a great fit?"
                          value={appData.cover_letter}
                          onChange={(e) =>
                            setAppData(prev => ({ ...prev, cover_letter: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button type="submit" className="w-full rounded-2xl py-6 shadow-glow font-bold">
                          {job.my_application ? 'Submit New Application' : 'Submit Application'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full rounded-xl"
                          onClick={() => setShowAppForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="rounded-3xl border shadow-sm overflow-hidden">
              <CardHeader className="py-4 border-b bg-muted/30">
                <CardTitle className="text-lg">About Client</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary text-lg">
                      {job.client_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold">{job.client_name}</h4>
                    <p className="text-xs text-muted-foreground">{job.client_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Verified Identity</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Payment Method Verified</span>
                </div>
              </CardContent>
            </Card>

            {role === 'client' && appsData?.data?.data && (
              <Card className="rounded-3xl border shadow-lg overflow-hidden animate-fade-in-up">
                <CardHeader className="bg-primary py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-primary-foreground">Applicants ({appsData.data.data.length})</CardTitle>
                  <Link href={`/my-posts/details/${jobId}`}>
                    <Button size="sm" variant="secondary" className="h-8 rounded-lg text-xs font-bold">Manage</Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[400px] overflow-y-auto">
                    {appsData.data.data.map((app) => (
                      <Link href={`/my-posts/applications/${app.id}`} key={app.id}>
                        <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {app.applicant_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-bold group-hover:text-primary transition-colors">
                                  {app.applicant_name}
                                </h4>
                                <p className="text-[10px] text-muted-foreground">
                                  Applied {new Date(app.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px]">{app.status}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {appsData.data.data.length === 0 && (
                      <div className="p-10 text-center opacity-50">
                        <p className="text-sm">No applications received yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

