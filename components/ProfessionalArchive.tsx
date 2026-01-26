
import React, { useState, useMemo } from 'react';
import { Search, MapPin, Briefcase, Star, ShieldCheck, Filter, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Availability, ProfessionalStatus, ProfessionalProfile } from '../types';

// Exported for HireFlow and other components that might need fallback data
export const MOCK_ARCHIVE_PROS: ProfessionalProfile[] = [
  {
    id: 'p-1',
    userId: 'Tunde Afolayan',
    category: 'Driver',
    bio: 'Experienced executive driver with over 10 years of experience navigating Lagos traffic safely.',
    location: 'Lekki, Lagos',
    availability: Availability.AVAILABLE,
    profileCompletion: 100,
    status: ProfessionalStatus.VERIFIED,
    publicVisible: true,
    createdAt: new Date().toISOString(),
    rating: 4.8,
    reviewCount: 24,
    completedJobs: 156,
    aptitudeScore: 92
  },
  {
    id: 'p-2',
    userId: 'Blessing Okon',
    category: 'Nanny',
    bio: 'Certified childcare professional with first aid training and a passion for early childhood development.',
    location: 'Ikeja, Lagos',
    availability: Availability.AVAILABLE,
    profileCompletion: 100,
    status: ProfessionalStatus.VERIFIED,
    publicVisible: true,
    createdAt: new Date().toISOString(),
    rating: 4.9,
    reviewCount: 42,
    completedJobs: 89,
    aptitudeScore: 88
  }
];

interface Props {
  proList: ProfessionalProfile[];
  onViewProfile: (id: string) => void;
  onHire: (pro: ProfessionalProfile) => void;
}

const ProfessionalArchive: React.FC<Props> = ({ proList, onViewProfile, onHire }) => {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Priority to dynamic proList from database
  const activeList = proList && proList.length > 0 ? proList : MOCK_ARCHIVE_PROS;

  const filteredPros = useMemo(() => {
    return activeList.filter(pro => {
      const matchCat = filterCategory === 'All' || pro.category === filterCategory;
      const matchLoc = filterLocation === 'All' || (pro.location && pro.location.includes(filterLocation));
      const matchStatus = filterStatus === 'All' || pro.availability === filterStatus;
      const matchSearch = (pro.userId || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (pro.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchLoc && matchStatus && matchSearch;
    });
  }, [filterCategory, filterLocation, filterStatus, searchQuery, activeList]);

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20">
      {/* Hero / Header Section */}
      <header className="bg-white border-b border-slate-100 pt-16 pb-12">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto space-y-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Find Trusted Professionals</h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Browse our network of vetted domestic experts ready to serve your home and family.
          </p>
        </div>
      </header>

      {/* Filter Section - Standardized Floating Utility Container */}
      <section className="sticky top-[72px] z-50 bg-transparent py-4 overflow-x-auto pointer-events-none">
        <div className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pointer-events-auto">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6">
            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#660033] transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or keyword..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none transition-all"
              />
            </div>

            {/* Dynamic Filter Row */}
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar w-full md:w-auto pb-2 md:pb-0">
              <div className="flex items-center gap-2 shrink-0 text-slate-400">
                <SlidersHorizontal size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
              </div>
              
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 outline-none hover:border-[#660033]/30"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 outline-none hover:border-[#660033]/30"
              >
                <option value="All">Any Status</option>
                <option value={Availability.AVAILABLE}>Available</option>
                <option value={Availability.ON_JOB}>Engaged</option>
              </select>

              <select 
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 outline-none hover:border-[#660033]/30"
              >
                <option value="All">All Locations</option>
                <option value="Lekki">Lekki</option>
                <option value="Ikeja">Ikeja</option>
                <option value="Victoria Island">V.I.</option>
                <option value="Ikoyi">Ikoyi</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Grid */}
      <main className="w-full px-6 md:px-0 md:w-[90vw] md:mx-auto pt-12">
        {filteredPros.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-200">
               <Search size={40} />
             </div>
             <p className="text-slate-400 font-medium italic">No professionals found matching your filters.</p>
             <button 
               onClick={() => { setFilterCategory('All'); setFilterLocation('All'); setFilterStatus('All'); setSearchQuery(''); }}
               className="text-[#660033] font-bold text-sm hover:underline"
             >
               Clear all filters
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredPros.map((pro) => (
              <div key={pro.id} className="bg-white border border-slate-200 rounded-[10px] overflow-hidden hover:border-[#660033]/30 hover:shadow-xl hover:shadow-[#660033]/5 transition-all group flex flex-col h-full">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img src={`https://picsum.photos/seed/${pro.id}/400/400`} alt={pro.userId} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur rounded-full flex items-center gap-1.5 shadow-sm">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-900">{pro.rating}</span>
                  </div>
                  {(pro.status === ProfessionalStatus.VERIFIED || pro.status === ProfessionalStatus.APPROVED) && (
                    <div className="absolute top-4 left-4 p-2 bg-[#660033] text-white rounded-full shadow-lg">
                      <ShieldCheck size={16} />
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">{pro.userId}</h3>
                    <div className="flex items-center gap-3 text-slate-500">
                       <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"><Briefcase size={12} /> {pro.category}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                       <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"><MapPin size={12} /> {pro.location?.split(',')[0]}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {pro.bio || "Certified professional ready to serve your household with top-tier expertise and reliability."}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Aptitude</p>
                      <p className="text-xs font-bold text-[#660033]">{pro.aptitudeScore || 0}% Score</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Availability</p>
                       <div className="flex items-center gap-1.5 justify-end">
                         <div className={`w-1.5 h-1.5 rounded-full ${pro.availability === Availability.AVAILABLE ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                         <p className={`text-xs font-bold ${pro.availability === Availability.AVAILABLE ? 'text-emerald-600' : 'text-amber-600'}`}>
                           {pro.availability === Availability.AVAILABLE ? 'Available' : 'Engaged'}
                         </p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex gap-2">
                   <button 
                    onClick={() => onViewProfile(pro.id)}
                    className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-[#660033] hover:text-[#660033] transition-all"
                   >
                     View Profile
                   </button>
                   <button 
                    onClick={() => onHire(pro)}
                    className="flex-1 py-3 bg-[#660033] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#660033]/10 hover:bg-[#2B0116] transition-all"
                   >
                     Hire Pro
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessionalArchive;
