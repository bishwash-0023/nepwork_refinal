'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { jobsAPI, proposalsAPI, messagesAPI } from '@/lib/api';
import useSWR from 'swr';
import { toast } from 'sonner';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  const [role, setRole] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({ bid_amount: '', cover_letter: '' });

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setRole(getUserRole());
    }
  }, [router]);

  const { data: jobData, mutate: mutateJob } = useSWR(
    jobId ? `/jobs/${jobId}` : null,
    () => jobsAPI.getById(jobId)
  );

  const { data: proposalsData, mutate: mutateProposals } = useSWR(
    role === 'client' && jobId ? `/jobs/${jobId}/proposals` : null,
    () => proposalsAPI.getJobProposals(jobId)
  );

  const { data: messagesData, mutate: mutateMessages } = useSWR(
    jobId ? `/jobs/${jobId}/messages` : null,
    () => messagesAPI.getJobMessages(jobId)
  );

  const job = jobData?.data?.data;

  // Show loading during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    try {
      await proposalsAPI.create({
        job_id: parseInt(jobId),
        ...proposalData,
      });
      toast.success('Proposal submitted successfully!');
      setShowProposalForm(false);
      setProposalData({ bid_amount: '', cover_letter: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit proposal');
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await proposalsAPI.updateStatus(proposalId, 'accepted');
      toast.success('Proposal accepted!');
      mutateProposals();
      mutateJob();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept proposal');
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5135'}/api/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 overflow-hidden">
          {job.image_path && (
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img
                src={getImageUrl(job.image_path)}
                alt={job.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription>Posted by {job.client_name}</CardDescription>
              </div>
              <Badge>{job.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{job.description}</p>
            <div className="flex gap-4">
              <span className="text-lg font-semibold text-primary">
                Budget: ${job.budget}
              </span>
            </div>
          </CardContent>
        </Card>

        {role === 'freelancer' && job.status === 'open' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Submit Proposal</CardTitle>
            </CardHeader>
            <CardContent>
              {!showProposalForm ? (
                <Button onClick={() => setShowProposalForm(true)}>
                  Submit Proposal
                </Button>
              ) : (
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bid Amount</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-md"
                      value={proposalData.bid_amount}
                      onChange={(e) =>
                        setProposalData({ ...proposalData, bid_amount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cover Letter</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows="4"
                      value={proposalData.cover_letter}
                      onChange={(e) =>
                        setProposalData({ ...proposalData, cover_letter: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Submit</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowProposalForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {role === 'client' && proposalsData?.data?.data && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Proposals ({proposalsData.data.data.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {proposalsData.data.data.map((proposal) => (
                <div key={proposal.id} className="border-b py-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{proposal.freelancer_name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{proposal.cover_letter}</p>
                      <p className="text-primary font-semibold mt-2">
                        Bid: ${proposal.bid_amount}
                      </p>
                    </div>
                    {proposal.status === 'pending' && (
                      <Button
                        onClick={() => handleAcceptProposal(proposal.id)}
                        size="sm"
                      >
                        Accept
                      </Button>
                    )}
                    {proposal.status === 'accepted' && (
                      <Badge variant="secondary">Accepted</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messagesData?.data?.data?.map((message) => (
                <div key={message.id} className="border-l-2 pl-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">{message.sender_name}</span>
                    <span className="text-sm text-gray-500">{message.created_at}</span>
                  </div>
                  <p className="text-gray-700 mt-1">{message.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

