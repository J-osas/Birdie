
import React, { useState, useMemo } from 'react';
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
  Video
} from 'lucide-react';
import { ProfessionalProfile, Availability } from '../types';
import { MOCK_ARCHIVE_PROS } from './ProfessionalArchive';
import { LAGOS_LOCATIONS } from '../constants';
import { dataService } from '../services/dataService';

interface Props {
  preselectedPro?: ProfessionalProfile;
  categories: string[];
  onClose: () => void;
  onSubmit: (requestData: any) => Promise<any>; // Changed to Promise to handle response
}

const HireFlow: React.FC<Props> = ({ preselectedPro, categories, onClose, onSubmit }) => {
  const [step, setStep] = useState(preselectedPro ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConsultationPrompt, setShowConsultationPrompt] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedPro?.category || '');
  const [selectedPro, setSelectedPro] = useState<ProfessionalProfile | undefined>(preselectedPro);

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
    notes: ''
  });

  const filteredPros = useMemo(() => {
    return MOCK_ARCHIVE_PROS.filter(p => p.category === selectedCategory && p.availability === Availability.AVAILABLE);
  }, [selectedCategory]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Fix: Ensure proName is passed so App.tsx can map it correctly
      const result = await onSubmit({ 
        ...formData, 
        proId: selectedPro?.id, 
        proName: selectedPro?.userId, // Map professional name
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
      
      if (result && result.id) {
        setCreatedRequestId(result.id);
        setShowConsultationPrompt(true);
      }
    } catch (e) {
      console.error("Submission failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookConsultation = async (method: 'OFFLINE' | 'PAYSTACK') => {
    if (!createdRequestId) return;
    try {
      setIsSubmitting(true);
      await dataService.createConsultation(createdRequestId, method);
      alert(method === 'PAYSTACK' ? "Redirecting to Paystack..." : "Consultation requested! Check your email for payment instructions.");
      onClose();
    } catch (e) {
      alert("Failed to book consultation. Please try again from your dashboard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConsultationPrompt) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 md:p-16 space-y-8 animate-in zoom-in duration-300 relative">
          <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900"><X size={24} /></button>
          
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={40} />
             </div>
             <h2 className="text-3xl font-bold text-slate-900">Request Submitted!</h2>
             <p className="text-slate-500 font-medium leading-relaxed">
               Your hire request is now <span className="font-bold text-[#660033]">PENDING</span>. Our team and the professional will review it immediately.
             </p>
          </div>

          <div className="bg-[#660033]/5 border border-[#660033]/10 rounded-[2.5rem] p-8 space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#660033] shadow-sm"><Video size={24} /></div>
                <div className="space-y-0.5">
                   <h4 className="font-bold text-slate-900">Optional: Book a Consultation</h4>
                   <p className="text-xs text-slate-500 font-medium">Get a 60-min expert session to finalize your match.</p>
                </div>
             </div>
             <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                <span>Fee</span>
                <span className="text-[#660033] font-black">₦10,000</span>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  disabled={isSubmitting}
                  onClick={() => handleBookConsultation('OFFLINE')}
                  className="py-4 bg-white border border-[#660033]/20 text-[#660033] rounded-2xl font-bold text-sm disabled:opacity-50"
                >
                  Pay Offline
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={() => handleBookConsultation('PAYSTACK')}
                  className="py-4 bg-[#660033] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#660033]/20 disabled:opacity-50"
                >
                  Secure with Paystack
                </button>
             </div>
          </div>

          <button onClick={onClose} className="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors uppercase tracking-widest">Skip for now, take me to my dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#F8FAFB] rounded-[3rem] shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in duration-300">
        
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 z-10 transition-all">
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-10 min-h-[600px]">
          {/* Progress Sidebar */}
          <div className="lg:col-span-3 bg-[#660033] p-10 text-white space-y-12 relative overflow-hidden hidden lg:block">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            
            <div className="space-y-1 relative z-10">
              <h3 className="text-2xl font-bold">{selectedPro ? 'Direct Hire' : 'Generic Hire'}</h3>
              <p className="text-white/60 text-sm font-medium">Entering PENDING state.</p>
            </div>

            <div className="space-y-8 relative z-10">
              {[
                { n: 1, title: 'Category', desc: 'Select expertise' },
                { n: 2, title: 'Personal', desc: 'Contact details' },
                { n: 3, title: 'Specifications', desc: 'Job requirements' },
                { n: 4, title: 'Finish', desc: 'Review & Submit' }
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

          {/* Main Content Area */}
          <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">Service Category</h2>
                  <p className="text-slate-500 font-medium italic">What support does your home need?</p>
                </div>

                {preselectedPro ? (
                  <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                     <div className="w-20 h-20 rounded-[1.5rem] bg-slate-100 overflow-hidden shrink-0 shadow-inner">
                        <img src={`https://picsum.photos/seed/${preselectedPro.id}/200/200`} className="w-full h-full object-cover" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#660033] uppercase tracking-widest">Matched Professional</p>
                        <h4 className="text-2xl font-bold text-slate-900">{preselectedPro.userId}</h4>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                           <Star size={12} className="fill-amber-400 text-amber-400" /> {preselectedPro.rating} • {selectedCategory}
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); nextStep(); }}
                        className={`p-6 bg-white border rounded-[2rem] hover:border-[#660033] hover:shadow-xl hover:shadow-[#660033]/5 transition-all text-center space-y-4 group ${selectedCategory === cat ? 'border-[#660033] bg-[#660033]/5' : 'border-slate-100'}`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-colors ${selectedCategory === cat ? 'bg-[#660033] text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-[#660033]/5 group-hover:text-[#660033]'}`}>
                          <Briefcase size={24} />
                        </div>
                        <p className={`font-bold text-sm ${selectedCategory === cat ? 'text-[#660033]' : 'text-slate-900'}`}>{cat}</p>
                      </button>
                    ))}
                  </div>
                )}
                
                {preselectedPro && (
                  <button onClick={nextStep} className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20">Confirm and Continue</button>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">Personal Details</h2>
                  <p className="text-slate-500 font-medium italic">We need your contact info to coordinate the hire.</p>
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
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                   <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="john@example.com" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                   <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="+234..." />
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400">Back</button>
                  <button onClick={nextStep} disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone} className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 disabled:opacity-50">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-2">
                   <h2 className="text-3xl font-bold text-slate-900">Job Specifications</h2>
                   <p className="text-slate-500 font-medium italic">Define the scope for your {selectedCategory}.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location / Neighborhood</label>
                      <select required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                         <option value="">Select Area</option>
                         {LAGOS_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Start Date</label>
                      <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" min={new Date().toISOString().split('T')[0]} />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Duration</label>
                      <select value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                         <option>Full-time</option>
                         <option>Part-time</option>
                         <option>Temporary / Short-term</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age Range Needed</label>
                      <input type="text" placeholder="e.g. 25-35 years" value={formData.ageRange} onChange={e => setFormData({...formData, ageRange: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none" />
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Living Conditions</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'BQ', label: 'Boy\'s Quarter (BQ)' },
                      { id: 'SPARE', label: 'Spare room in main house' },
                      { id: 'SHARED', label: 'Shared room' },
                      { id: 'LIVING', label: 'Living room' },
                      { id: 'OTHER', label: 'Other' }
                    ].map(cond => (
                      <button 
                        key={cond.id} 
                        onClick={() => setFormData({...formData, livingCondition: cond.id})} 
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between group transition-all ${formData.livingCondition === cond.id ? 'border-[#660033] bg-[#660033]/5 text-[#660033]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#660033]/20'}`}
                      >
                         <span className="font-bold text-xs uppercase tracking-widest">{cond.label}</span>
                         {formData.livingCondition === cond.id && <CheckCircle2 size={18} />}
                      </button>
                    ))}
                  </div>
                  {formData.livingCondition === 'OTHER' && (
                    <input type="text" placeholder="Specify living conditions..." value={formData.livingConditionOther} onChange={e => setFormData({...formData, livingConditionOther: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none animate-in slide-in-from-top-2" />
                  )}
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">How did you hear about us?</label>
                   <select value={formData.discovery} onChange={e => setFormData({...formData, discovery: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="">Select Option</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                      <option>Referral / Word of mouth</option>
                      <option>Google Search</option>
                      <option>Other</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Additional Requirements & Notes</label>
                   <textarea rows={3} placeholder="Experience level needed, specific skills, etc..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-medium resize-none" />
                </div>

                <div className="flex gap-4 pt-4 pb-8">
                  <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400">Back</button>
                  <button onClick={nextStep} disabled={!formData.location || !formData.startDate} className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 disabled:opacity-50">Continue</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="text-center space-y-4">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                      <ShieldCheck size={40} />
                   </div>
                   <h2 className="text-3xl font-bold text-slate-900">Final Verification</h2>
                   <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed italic">
                     Your request will be submitted in <span className="font-bold text-[#660033]">PENDING</span> state. No payment is required for the hire at this stage.
                   </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-4 shadow-sm">
                   <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      <span>Service</span>
                      <span className="text-slate-900">{selectedCategory} Request</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      <span>Location</span>
                      <span className="text-slate-900">{formData.location}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      <span>Living Mode</span>
                      <span className="text-slate-900">{formData.livingCondition}</span>
                   </div>
                   <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initial Status</span>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase border border-amber-100 tracking-widest">Pending Review</span>
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <>Submit Hire Request <ArrowRight size={20} /></>}
                  </button>
                  <button onClick={prevStep} className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest hover:text-[#660033] transition-colors">Wait, I need to edit something</button>
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
