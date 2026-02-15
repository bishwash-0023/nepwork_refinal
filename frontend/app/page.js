import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Freelance Platform</h1>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            Find the Perfect Freelancer
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect with talented professionals or offer your skills
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <Button size="lg">Start as Client</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">Start as Freelancer</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Post Jobs</CardTitle>
              <CardDescription>
                Post your project and receive proposals from skilled freelancers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browse Projects</CardTitle>
              <CardDescription>
                Find projects that match your skills and submit proposals
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Communication</CardTitle>
              <CardDescription>
                Chat with clients or freelancers directly through our platform
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}

