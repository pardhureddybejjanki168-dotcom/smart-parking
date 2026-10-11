import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ParkingSquare,
  ShieldCheck,
  Activity,
  CalendarCheck,
  ArrowRight,
  Car,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-navy-700 text-white rounded-lg shadow">
              <ParkingSquare className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-navy-800">ParkSmart</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}>
                <Button variant="primary">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Create Account</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" /> Next-Generation IoT Parking Management
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Smart Parking Management, <br />
            <span className="text-navy-700">Simplified & Real-Time.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate parking hassles with live slot availability, instant reservations, automated vehicle session tracking, and intelligent analytics.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/register'}>
              <Button size="lg" className="shadow-lg shadow-navy-700/20 text-base">
                Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-base">
                Existing User Login
              </Button>
            </Link>
          </div>

          {/* Highlights ribbon */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-slate-800">Live Telemetry</p>
                <p className="text-xs text-slate-500">Real-time status updates</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-sky-500" />
              <div>
                <p className="text-sm font-bold text-slate-800">Quick Booking</p>
                <p className="text-xs text-slate-500">Reserve spots in seconds</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <Car className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-sm font-bold text-slate-800">Multi-Vehicle</p>
                <p className="text-xs text-slate-500">Cars, bikes, and EVs</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm font-bold text-slate-800">Zero Wait Time</p>
                <p className="text-xs text-slate-500">Guaranteed bay access</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Engineered for Seamless Mobility</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto text-sm">
                Built from the ground up for residential complexes, corporate towers, and commercial hubs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Slot Monitoring</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Interactive visual floor map with live status colors. Know immediately which bays are open, occupied, or reserved.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-6">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Effortless Reservations</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Plan ahead and secure parking for specific time windows. Receive notifications and seamless one-click gate check-in.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Secure & Audited System</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Comprehensive audit logs, role-based security, automated session timers, and reliable administrative oversight.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} ParkSmart Vehicle Parking Slot Monitoring System. All rights reserved.</p>
      </footer>
    </div>
  );
};
