import { Link, Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-auto">
        <div className="bg-white border-t border-slate-100">
          <div className="w-full px-6 md:w-[90vw] md:mx-auto py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#660033] text-white font-bold flex items-center justify-center">
                  B
                </div>
                <p className="text-2xl font-bold text-[#0A0A0A]">Birdie</p>
              </div>
              <p className="text-[#615A5C] font-medium max-w-md leading-relaxed">
                Trusted domestic staffing for Lagos households — structure, dignity, and escrow-backed hiring for families and professionals.
              </p>
              <p className="text-sm font-bold text-[#660033]">Lagos, Nigeria · support@birdie.ng</p>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Company</p>
              <Link to="/about" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                About
              </Link>
              <Link to="/story" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Our Story
              </Link>
              <Link to="/contact" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Contact
              </Link>
              <Link to="/blog" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Insights
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Platform</p>
              <Link to="/professionals" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Find Pros
              </Link>
              <Link to="/hire" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Hire
              </Link>
              <Link to="/register?role=professional" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Become a Provider
              </Link>
              <Link to="/login" className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#660033]">
                Sign in
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-[#660033] text-white">
          <div className="w-full px-6 md:w-[90vw] md:mx-auto py-5 flex flex-col sm:flex-row justify-between gap-3 text-xs font-bold uppercase tracking-[0.15em] text-white/70">
            <span>© {new Date().getFullYear()} Birdie.ng</span>
            <span>Domestic staffing · Built for Lagos homes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
