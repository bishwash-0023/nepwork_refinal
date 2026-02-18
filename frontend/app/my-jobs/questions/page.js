'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { questionsAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import {
    MessageSquare,
    ArrowRight,
    Calendar,
    User,
    Briefcase,
    Globe,
    Lock,
    Clock,
    CheckCircle2
} from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MyQuestionsPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const { data, error, isLoading, mutate } = useSWR(
        mounted ? '/questions/my' : null,
        () => questionsAPI.getMyJobQuestions()
    );

    const questions = data?.data?.data || [];

    const handleAnswerPublicly = async (qId, answer) => {
        if (!answer.trim()) return;
        try {
            await questionsAPI.answer(qId, answer);
            toast.success('Answer posted successfully');
            mutate();
        } catch (error) {
            toast.error('Failed to post answer');
        }
    };

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-10 w-48 mb-6 rounded-xl" />
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <Navbar />

            <div className="bg-primary/5 border-b mb-8">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Questions</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Respond to inquiries from potential freelancers across your jobs.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl">
                {questions.length === 0 ? (
                    <Card className="border-2 border-dashed bg-muted/5 py-20 text-center rounded-3xl">
                        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                        <h3 className="text-xl font-bold">No questions yet</h3>
                        <p className="text-muted-foreground">When freelancers ask questions about your jobs, they will appear here.</p>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {questions.map((q) => (
                            <Card key={q.id} className={`rounded-3xl border-2 transition-all hover:shadow-lg ${!q.answer ? 'border-primary/20 shadow-glow' : 'border-muted'}`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${!q.answer ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                        <MessageSquare className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold flex items-center gap-2">
                                                            {q.job_title}
                                                            {!q.is_public && (
                                                                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-none text-[9px] uppercase font-black">Private</Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <User className="h-3 w-3" /> {q.asker_name} • <Clock className="h-3 w-3" /> {new Date(q.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant={q.answer ? "success" : "secondary"} className="h-6">
                                                    {q.answer ? 'Answered' : 'Pending'}
                                                </Badge>
                                            </div>

                                            <div className="bg-muted/30 p-4 rounded-2xl italic font-medium text-sm border-l-4 border-primary/20">
                                                "{q.content}"
                                            </div>

                                            {!q.answer ? (
                                                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                                    <textarea
                                                        className="flex-1 px-4 py-3 text-sm border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none bg-background shadow-inner"
                                                        placeholder="Write your answer..."
                                                        id={`ans-${q.id}`}
                                                    />
                                                    <Button
                                                        className="rounded-2xl h-auto px-6 font-bold shadow-glow"
                                                        onClick={() => {
                                                            const val = document.getElementById(`ans-${q.id}`).value;
                                                            handleAnswerPublicly(q.id, val);
                                                        }}
                                                    >
                                                        Reply
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="pt-4 border-t border-dashed">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Answer</span>
                                                    </div>
                                                    <p className="text-sm text-foreground/80 leading-relaxed pl-6">
                                                        {q.answer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="md:w-48 flex flex-col justify-between">
                                            <Link href={`/jobs/${q.job_id}`}>
                                                <Button variant="outline" className="w-full rounded-xl text-xs h-10 border-dashed border-2 hover:bg-muted group">
                                                    View Job Posting <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
