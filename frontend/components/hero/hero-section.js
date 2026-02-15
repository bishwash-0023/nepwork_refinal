'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Briefcase, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    { icon: Briefcase, text: 'Post Jobs Instantly' },
    { icon: Users, text: 'Find Top Talent' },
    { icon: MessageSquare, text: 'Secure Messaging' },
    { icon: CheckCircle2, text: 'Verified Freelancers' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-400"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-800"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-8 ${
              mounted ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Trusted by 10,000+ Users</span>
          </div>

          {/* Main heading */}
          <h1
            className={`text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient ${
              mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'
            }`}
          >
            Find the Perfect
            <br />
            <span className="text-gray-900">Freelancer</span>
          </h1>

          {/* Subheading */}
          <p
            className={`text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto ${
              mounted ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'
            }`}
          >
            Connect with talented professionals or showcase your skills.
            <br />
            Build your dream project with the best freelancers in the industry.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 ${
              mounted ? 'animate-fade-in-up animation-delay-600' : 'opacity-0'
            }`}
          >
            <Link href="/register">
              <Button
                size="lg"
                className="group text-lg px-8 py-6 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start as Client
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto border-2 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Start as Freelancer
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto ${
              mounted ? 'animate-fade-in-up animation-delay-800' : 'opacity-0'
            }`}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200 hover:bg-white/80 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  style={{
                    animationDelay: `${1000 + index * 100}ms`,
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 ${
          mounted ? 'animate-float' : 'opacity-0'
        }`}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-float"></div>
        </div>
      </div>
    </div>
  );
}

