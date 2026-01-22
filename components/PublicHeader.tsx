
import React from 'react';
import { Menu, X, LogIn, Search } from 'lucide-react';

interface Props {
  onLoginClick: () => void;
  onViewArchive: () => void;
  onViewBlog: () => void;
  onViewAbout: () => void;
  onViewStory: () => void;
  onViewContact: () => void;
  onViewHome: () => void;
}

const PublicHeader: React.FC<Props> = ({ onLoginClick, onViewArchive, onViewBlog, onViewAbout, onViewStory, onViewContact, onViewHome }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-[70] bg-white/80 backdrop-blur-md border-b border-slate-100 py-4">
      <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onViewHome}
        >
          <div className="w-8 h-8 bg-[#660033] rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="font-bold text-lg text-white">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0a0a0a]">Birdie</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={onViewHome}
            className="text-sm font-bold text-slate-500 hover:text-[#660033] transition-colors"
          >
            Home
          </button>
          <button 
            onClick={onViewArchive}
            className="text-sm font-bold text-slate-500 hover:text-[#660033] transition-colors"
          >
            Find Professionals
          </button>
          <button 
            onClick={onViewAbout}
            className="text-sm font-bold text-slate-500 hover:text-[#660033] transition-colors"
          >
            About
          </button>
          <button 
            onClick={onViewStory}
            className="text-sm font-bold text-slate-500 hover:text-[#660033] transition-colors"
          >
            Our Story
          </button>
          <button 
            onClick={onViewBlog}
            className="text-sm font-bold text-slate-500 hover:text-[#660033] transition-colors"
          >
            Blog
          </button>
          <button 
            onClick={onViewContact}
            className="text-sm font-bold text-slate-500 hover:text-[#660033] transition-colors"
          >
            Contact
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onLoginClick}
            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#660033] text-white rounded-xl text-sm font-bold hover:bg-[#2B0116] transition-all shadow-lg shadow-[#660033]/20"
          >
            <LogIn size={18} />
            Login / Register
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <button onClick={() => { onViewHome(); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-slate-500">Home</button>
          <button onClick={() => { onViewArchive(); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-slate-500">Find Professionals</button>
          <button onClick={() => { onViewAbout(); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-slate-500">About</button>
          <button onClick={() => { onViewStory(); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-slate-500">Our Story</button>
          <button onClick={() => { onViewBlog(); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-slate-500">Blog</button>
          <button onClick={() => { onViewContact(); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-slate-500">Contact</button>
          <div className="pt-4">
            <button 
              onClick={onLoginClick}
              className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold flex items-center justify-center gap-3"
            >
              <LogIn size={20} />
              Login / Register
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicHeader;
