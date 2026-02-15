'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Search, Shield, DollarSign, Clock, Star } from 'lucide-react';

export default function FeaturesSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Briefcase,
      title: 'Post Jobs',
      description: 'Post your project and receive proposals from skilled freelancers worldwide.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Search,
      title: 'Browse Projects',
      description: 'Find projects that match your skills and submit competitive proposals.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Secure Communication',
      description: 'Chat with clients or freelancers directly through our secure platform.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: DollarSign,
      title: 'Fair Pricing',
      description: 'Set your own rates or find freelancers within your budget.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Clock,
      title: 'Quick Turnaround',
      description: 'Get your projects completed quickly with our efficient workflow.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Star,
      title: 'Quality Reviews',
      description: 'Rate and review work to build trust and reputation in the community.',
      color: 'from-red-500 to-rose-500',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div
          className={`text-center mb-16 ${
            mounted ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to connect, collaborate, and succeed
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`overflow-hidden border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  mounted ? 'animate-scale-in' : 'opacity-0'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

