
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Briefcase, 
  CheckCircle2,
  Users,
  ArrowRight,
  Star,
  X,
  Loader2,
  Info,
  MessageSquare,
  Smartphone,
  Mail,
  User as UserIcon,
  HelpCircle,
  Video,
  Clock,
  Globe,
  CreditCard,
  Lock,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react';
import { ProfessionalProfile, Availability, RequestStatus } from '../types';
import { MOCK_ARCHIVE_PROS } from './ProfessionalArchive';
import { LAGOS_LOCATIONS } from '../constants';
import { dataService } from '../services/dataService';

interface Props {
  preselectedPro?: ProfessionalProfile;
  categories: string[];
  onClose: () => void;
  onSubmit: (requestData: any) => Promise<any>;
}

const HireFlow: React.FC<Props> = ({ preselectedPro, categories, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Selection State
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedPro?.category || '');
  const [selectedPro, setSelectedPro] = useState<ProfessionalProfile | undefined>(preselectedPro);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    startDate: '',
    location: '',
    ageRange: '',
    duration: 'Full-time',
    experienceLevel: '',
    livingCondition: 'BQ' as any,
    livingConditionOther: '',
    discovery: '',
    notes: '',
    consultationDate: '',
    consultationTime: ''
  });

  // Filtered pros for Path A
  const availablePros = useMemo(() => {
    return MOCK_ARCHIVE_PROS.filter(p => p.category === selectedCategory && p.availability === Availability.AVAILABLE);
  }, [selectedCategory]);

  useEffect(() => {
    if (preselectedPro) {
      setSelectedCategory(preselectedPro.category);
      setSelectedPro(preselectedPro);
      setStep(2); // Jump to Personal Details if pro is preselected
    }
  }, [preselectedPro]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Submit IR Request & Auto-create account logic
      await onSubmit({ 
        ...formData, 
        proId: selectedPro?.id, 
        proName: selectedPro?.userId,
        category: selectedCategory,
        requirements: {
          ageRange: formData.ageRange,
          duration: formData.duration,
          experienceLevel: formData.experienceLevel,
          livingCondition: formData.livingCondition,
          livingConditionOther: formData.livingConditionOther,
          notes: formData.notes
        }
      });
      
      // 2. Mock payment confirmation (Actual API call handled in App.tsx -> dataService)
      setShowSuccess(true);
    } catch (e) {
      console.error("Submission failed:", e);
      alert("Registration or submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 md:p-16 space-y-8 animate-in zoom-in duration-300 relative text-center">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
             <CheckCircle2 size={48} />
          </div>
          <div className="space-y-4">
             <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Hire Request Submitted!</h2>
             <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto italic">
               Your request for <span className="text-[#660033] font-bold">{selectedCategory}</span> support is now <span className="font-bold text-[#660033]">PENDING REVIEW</span>.
             </p>
             <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm text-slate-600 font-medium">
               Consultation Booked: <span className="font-bold">{formData.consultationDate} at {formData.consultationTime}</span>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderProgress = () => (
    <div className="lg:col-span-3 bg-[#660033] p-10 text-white space-y-12 relative overflow-hidden hidden lg:block">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
      <div className="space-y-1 relative z-10">
        <h3 className="text-2xl font-bold">Hiring Request</h3>
        <p className="text-white/60 text-sm font-medium">Follow the 6 steps below.</p>
      </div>
      <div className="space-y-8 relative z-10">
        {[
          { n: 1, title: 'Selection', desc: 'Path A/B convergence' },
          { n: 2, title: 'Client Info', desc: 'Identity & contact' },
          { n: 3, title: 'Scope', desc: 'Job requirements' },
          { n: 4, title: 'Consultation', desc: 'Expert session' },
          { n: 5, title: 'Secure Fee', desc: '₦10,000 Payout' },
          { n: 6, title: 'Confirmation', desc: 'Request PENDING' }
        ].map((s) => (
          <div key={s.n} className={`flex gap-4 items-start transition-all ${step >= s.n ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              step === s.n ? 'bg-white text-[#660033] shadow-lg' : 'bg-white/10 text-white border border-white/20'
            }`}>
              {step > s.n ? <CheckCircle2 size={16} /> : s.n}
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-sm">{s.title}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#F8FAFB] rounded-[3rem] shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 z-10 transition-all">
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-10 min-h-[700px]">
          {renderProgress()}

          <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* STEP 1: Selection (Path A/B) */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Step 1: Choose Your Expert</h2>
                  <p className="text-slate-500 font-medium italic">Select a service category to browse available professionals.</p>
                </div>
                
                {categories.length === 0 ? (
                  <div className="py-12 px-6 bg-amber-50 border border-amber-100 rounded-[2rem] text-center space-y-4">
                    <AlertTriangle className="mx-auto text-amber-500" size={48} />
                    <p className="text-amber-800 font-bold">No service categories found.</p>
                    <p className="text-sm text-amber-600">Please contact support or check your network connection.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setSelectedPro(undefined); }}
                        className={`p-6 bg-white border rounded-[2rem] transition-all text-center space-y-4 group ${selectedCategory === cat ? 'border-[#660033] bg-[#660033]/5' : 'border-slate-100'}`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-colors ${selectedCategory === cat ? 'bg-[#660033] text-white' : 'bg-slate-50 text-slate-400'}`}>
                          <Briefcase size={24} />
                        </div>
                        <p className={`font-bold text-sm ${selectedCategory === cat ? 'text-[#660033]' : 'text-slate-900'}`}>{cat}</p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedCategory && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Available {selectedCategory}s</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availablePros.map(pro => (
                        <button 
                          key={pro.id}
                          onClick={() => setSelectedPro(pro)}
                          className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${selectedPro?.id === pro.id ? 'bg-[#660033]/5 border-[#660033]' : 'bg-white border-slate-100'}`}
                        >
                          <img src={`https://picsum.photos/seed/${pro.id}/100/100`} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-900 truncate">{pro.userId}</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500">
                               <Star size={10} className="fill-amber-500" /> {pro.rating}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button 
                  disabled={!selectedCategory || !selectedPro}
                  onClick={nextStep} 
                  className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 disabled:opacity-50 transition-all"
                >
                  Confirm Professional <ArrowRight size={20} className="inline ml-1" />
                </button>
              </div>
            )}

            {/* STEP 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Step 2: Client Identity</h2>
                  <p className="text-slate-500 font-medium italic">We'll use this to create your Birdie account securely.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                      <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="John" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="Doe" />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Connection</label>
                   <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="john@example.com" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                   <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="+234..." />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Neighborhood (Lagos)</label>
                   <select required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="">Select Area</option>
                      {LAGOS_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                   </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400">Back</button>
                  <button onClick={nextStep} disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.location} className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 disabled:opacity-50">Continue to Scope</button>
                </div>
              </div>
            )}

            {/* STEP 3: Job Requirements */}
            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                   <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Step 3: Job Scope</h2>
                   <p className="text-slate-500 font-medium italic">Define the specific expectations for this role.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Start Date</label>
                      <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" min={new Date().toISOString().split('T')[0]} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Required Experience Level</label>
                      <select value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                         <option>Entry (0-2 years)</option>
                         <option>Intermediate (3-5 years)</option>
                         <option>Senior (5+ years)</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Arrangement</label>
                   <div className="grid grid-cols-2 gap-4">
                      {['Live-in', 'Live-out'].map(arrangement => (
                        <button 
                          key={arrangement}
                          onClick={() => setFormData({...formData, duration: arrangement})}
                          className={`py-4 rounded-2xl border font-bold text-sm uppercase transition-all ${formData.duration === arrangement ? 'bg-[#660033] text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                        >
                          {arrangement}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Specific Requirements & Notes</label>
                   <textarea rows={4} placeholder="E.g. Must handle high-pressure Lagos environments, child safety training required, etc..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-medium resize-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400">Back</button>
                  <button onClick={nextStep} disabled={!formData.startDate} className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 disabled:opacity-50">Continue to Consultation</button>
                </div>
              </div>
            )}

            {/* STEP 4: Consultation Booking */}
            {step === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                   <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Step 4: Book Consultation</h2>
                   <p className="text-slate-500 font-medium italic">A mandatory 60-min session with Birdie Officials to verify the match.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-8">
                   <div className="flex items-center gap-4 text-emerald-600">
                      <Globe size={24} />
                      <span className="text-sm font-bold uppercase tracking-widest">Timezone: Africa/Lagos (GMT+1)</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Select Date</label>
                        <input type="date" value={formData.consultationDate} onChange={e => setFormData({...formData, consultationDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" min={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Select Time</label>
                        <select value={formData.consultationTime} onChange={e => setFormData({...formData, consultationTime: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                           <option value="">Choose Slot</option>
                           <option>09:00 AM</option>
                           <option>11:00 AM</option>
                           <option>02:00 PM</option>
                           <option>04:00 PM</option>
                        </select>
                      </div>
                   </div>
                   <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                      <Info size={18} className="text-amber-600 mt-1 shrink-0" />
                      <p className="text-xs text-amber-800 font-medium italic leading-relaxed">This consultation is mandatory before IR Request approval. It ensures safety and expectation alignment.</p>
                   </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400">Back</button>
                  <button onClick={nextStep} disabled={!formData.consultationDate || !formData.consultationTime} className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 disabled:opacity-50">Proceed to Payment</button>
                </div>
              </div>
            )}

            {/* STEP 5: Consultation Payment */}
            {step === 5 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                   <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Step 5: Secure Fee</h2>
                   <p className="text-slate-500 font-medium italic">Payment of the consultation fee is required to finalize the request.</p>
                </div>
                <div className="bg-[#660033] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
                   <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                         <span className="text-xs font-bold uppercase tracking-widest text-white/60">Service</span>
                         <span className="font-bold">Consultation Session</span>
                      </div>
                      <div className="flex justify-between items-center text-3xl font-black">
                         <span>Total Due</span>
                         <span>₦10,000</span>
                      </div>
                      <div className="pt-4 flex items-center gap-3 text-white/50">
                         <Lock size={16} />
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em]">PCI-DSS Secure Checkout</span>
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button className="flex items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                      <img src="https://paystack.com/assets/img/v3/paystack-logo-footer.png" className="h-4" alt="Paystack" />
                   </button>
                   <button className="flex items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm">
                      <ArrowRightLeft size={18} /> Offline Bank Transfer
                   </button>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400">Back</button>
                  <button onClick={nextStep} className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20">Confirm & Finalize</button>
                </div>
              </div>
            )}

            {/* STEP 6: Confirmation */}
            {step === 6 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500 text-center">
                <div className="space-y-4">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 size={48} />
                   </div>
                   <h2 className="text-4xl font-bold text-slate-900">Verify & Submit</h2>
                   <p className="text-slate-500 font-medium italic">Please review your data before finalizing your hiring request.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 text-left space-y-4">
                   <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Expert</span>
                      <span className="font-bold text-[#660033]">{selectedPro?.userId}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Start Date</span>
                      <span className="font-bold text-slate-900">{formData.startDate}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Consultation</span>
                      <span className="font-bold text-slate-900">{formData.consultationDate} @ {formData.consultationTime}</span>
                   </div>
                   <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Final Status</span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[9px] font-bold uppercase tracking-widest">PENDING REVIEW</span>
                   </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <>Create Request <ArrowRight size={20} /></>}
                  </button>
                  <button onClick={prevStep} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#660033] transition-colors">Wait, I need to edit</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default HireFlow;
