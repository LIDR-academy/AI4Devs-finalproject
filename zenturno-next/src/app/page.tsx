"use client";

import Link from 'next/link';
import { AuroraText } from '@/components/magicui/aurora-text';
import { RippleButton } from '@/components/magicui/ripple-button';
import { ScrollProgress } from '@/components/magicui/scroll-progress';
import { Meteors } from '@/components/magicui/meteors';
import { MagicCard } from '@/components/magicui/magic-card';
import { Marquee } from '@/components/magicui/marquee';
import { BorderBeam } from '@/components/magicui/border-beam';
import { Particles } from '@/components/magicui/particles';
import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-blue-950">
      <ScrollProgress />
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="border-b border-white/10 backdrop-blur-md bg-black/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">Z</div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">ZenTurno</span>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-sm font-medium text-white hover:text-blue-300 transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-sm font-medium text-white hover:text-blue-300 transition-colors">
                  Pricing
                </Link>
                <Link href="#testimonials" className="text-sm font-medium text-white hover:text-blue-300 transition-colors">
                  Testimonials
                </Link>
                <Link href="#faq" className="text-sm font-medium text-white hover:text-blue-300 transition-colors">
                  FAQ
                </Link>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-200 backdrop-blur-sm shadow-lg shadow-blue-500/10"
                >
                  Sign Up Free
                </Link>
                
                {/* Mobile menu button */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden rounded-md p-2 text-white hover:text-blue-300 hover:bg-white/10 transition-colors"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Mobile menu, show/hide based on menu state */}
            <div 
              className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-64 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
            >
              <div className="space-y-2 pt-2">
                <Link 
                  href="#features" 
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  href="#pricing" 
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href="#testimonials" 
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link 
                  href="#faq" 
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link 
                  href="/login" 
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative text-white pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-900 z-0"></div>
        <Particles
          className="absolute inset-0 z-10"
          color="rgba(255, 255, 255, 0.3)"
          quantity={100}
          staticity={30}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="relative inline-block mb-6 rounded-full px-4 py-1.5 text-sm font-medium bg-blue-900/20 border border-blue-700">
              <BorderBeam
                className="absolute inset-0"
                duration={20}
                size={500}
                delay={0.1}
                colorFrom="rgb(125, 211, 252)"
                colorTo="rgb(125, 211, 252)"
              />
              <span className="relative z-10 text-blue-100">✨ Appointment booking made simple</span>
            </div>
            <AuroraText
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
              colors={["#FFFFFF", "#A5F3FC", "#BAE6FD"]}
            >
              Simplify Your Appointment Booking
            </AuroraText>
            <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
              ZenTurno makes it easy to book and manage appointments with professionals.
              Save time, reduce no-shows, and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/signup">
                <RippleButton 
                  className="px-8 py-4 rounded-md bg-white text-blue-600 font-semibold hover:bg-gray-100 border-0 shadow-lg"
                  rippleColor="rgba(59, 130, 246, 0.4)"
                >
                  Get Started Free
                </RippleButton>
              </Link>
              <Link href="#features">
                <RippleButton 
                  className="px-8 py-4 rounded-md border border-white/30 bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20"
                  rippleColor="rgba(255, 255, 255, 0.4)"
                >
                  See How It Works
                </RippleButton>
              </Link>
            </div>
            <div className="mt-12 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-xl max-w-2xl mx-auto">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col">
                  {/* Dashboard mockup UI */}
                  <div className="h-12 bg-blue-800/50 border-b border-white/10 flex items-center px-4">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                    <div className="flex-1"></div>
                    <div className="w-24 h-6 rounded-md bg-white/10"></div>
                  </div>
                  <div className="flex flex-1">
                    {/* Sidebar */}
                    <div className="w-1/4 bg-blue-950/30 border-r border-white/10 p-4 space-y-4">
                      <div className="w-full h-8 rounded-md bg-white/10"></div>
                      <div className="w-full h-8 rounded-md bg-white/10"></div>
                      <div className="w-full h-8 rounded-md bg-blue-500/50"></div>
                      <div className="w-full h-8 rounded-md bg-white/10"></div>
                    </div>
                    {/* Main content */}
                    <div className="flex-1 p-4 space-y-4">
                      <div className="w-full h-10 rounded-md bg-white/10"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 rounded-md bg-blue-500/20 border border-blue-500/30"></div>
                        <div className="h-24 rounded-md bg-purple-500/20 border border-purple-500/30"></div>
                        <div className="h-24 rounded-md bg-green-500/20 border border-green-500/30"></div>
                      </div>
                      <div className="w-full h-48 rounded-md bg-white/10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">What Our Users Say</h2>
          <Marquee pauseOnHover className="py-4">
            {[
              "ZenTurno has completely transformed how I manage my salon appointments! - Sarah K.",
              "No more double bookings or scheduling headaches. Highly recommended! - Michael T.",
              "My clients love how easy it is to book appointments online. - Jessica R.",
              "The best scheduling platform I&apos;ve used in my 10 years as a professional. - David M.",
              "Simple, intuitive, and reliable. Just what my business needed. - Laura B.",
            ].map((testimonial, i) => (
              <div key={i} className="mx-4 px-8 py-4 bg-white rounded-lg shadow-md min-w-[300px]">
                <p className="text-gray-700">&quot;{testimonial}&quot;</p>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ZenTurno</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers everything you need to streamline your appointment booking process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Easy Booking"
              description="Book appointments with just a few clicks. Choose your preferred professional, service, and time slot."
              icon="🗓️"
            />
            <FeatureCard 
              title="Instant Confirmation"
              description="Receive immediate confirmation for your appointments. No more waiting for callbacks."
              icon="✅"
            />
            <FeatureCard 
              title="Reminders"
              description="Get timely reminders for your upcoming appointments so you never miss one."
              icon="⏰"
            />
            <FeatureCard 
              title="Manage Schedule"
              description="Professionals can easily manage their availability and view their appointment schedule."
              icon="📊"
            />
            <FeatureCard 
              title="Service Customization"
              description="Offer various services with custom pricing and duration to meet your business needs."
              icon="⚙️"
            />
            <FeatureCard 
              title="Client Management"
              description="Keep track of your clients' information and appointment history in one place."
              icon="👥"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative text-white overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 z-0"></div>
        <Meteors 
          number={20} 
          className="z-0" 
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AuroraText
            className="text-3xl font-bold mb-4"
            colors={["#FFFFFF", "#A5F3FC", "#BAE6FD"]}
          >
            Ready to Get Started?
          </AuroraText>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join ZenTurno today and transform how you manage appointments.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <RippleButton 
                className="px-6 py-3 rounded-md bg-white text-blue-600 font-semibold hover:bg-gray-100 border-0"
                rippleColor="rgba(59, 130, 246, 0.4)"
              >
                Sign Up Now
              </RippleButton>
            </Link>
            <Link href="/login">
              <RippleButton 
                className="px-6 py-3 rounded-md border border-white text-white font-semibold hover:bg-blue-500"
                rippleColor="rgba(255, 255, 255, 0.4)"
              >
                Sign In
              </RippleButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ZenTurno</h3>
              <p className="text-gray-300">
                Simplifying appointment booking for professionals and clients.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="/login" className="text-gray-300 hover:text-white">Sign In</Link></li>
                <li><Link href="/signup" className="text-gray-300 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300 mb-2">info@zenturno.com</p>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p> 2023 ZenTurno. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <MagicCard className="bg-white p-6 rounded-lg shadow-md border border-transparent">
      <div className="relative z-10">
        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </MagicCard>
  );
}
