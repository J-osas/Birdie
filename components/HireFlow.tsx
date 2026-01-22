
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Briefcase, 
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  ArrowRight,
  // Added Star to imports
  Star
} from 'lucide-react';
import { CATEGORIES, GET_STATUS_STYLE } from '../constants';
import { ProfessionalProfile, Availability } from '../types';
import { MOCK_ARCHIVE_PROS } from './ProfessionalArchive';

interface Props {
  preselectedPro?: ProfessionalProfile;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

const CONSULTATION_FEE = 5000;

const HireFlow: React.FC<Props> = ({ preselectedPro, onClose, onSubmit }) => {
  const [step, setStep] = useState(preselectedPro ? 2 : 1);
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedPro?.category || '');
  const [selectedPro, setSelectedPro] = useState<ProfessionalProfile | undefined>(preselectedPro);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    startDate: '',
    location: '',
    duration: 'Full-time',
    experienceLevel: 'Mid-level',
    livingCondition: 'Live-out',
    ageRange: '',
    notes: ''
  });

  const [booking, setBooking] = useState({
    date: '',
    time: ''
  });

  const filteredPros = useMemo(() => {
    return MOCK_ARCHIVE_PROS.filter(p => p.category === selectedCategory && p.availability === Availability.AVAILABLE);
  }, [selectedCategory]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const steps = [
    { n: 1, title: 'Professional' },
    { n: 2, title: 'Requirements' },
    { n: 3, title: 'Consultation' },
    { n: 4, title: 'Payment' },
    { n: 5, title: 'Done' }
  ];

  const handleFinalSubmit = () => {
    onSubmit({ ...formData, ...booking, proId: selectedPro?.id, category: selectedCategory });
    nextStep();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full px-4 md:px-0 md:w-[90vw] bg-[#F8FAFB] rounded-[3rem] shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        {step < 5 && (
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 z-10"
          >
            <ChevronLeft className="rotate-180" size={24} />
          </button>
        )}

        {/* Progress Bar */}
        {step < 5 && (
          <div className="bg-white px-8 pt-10 pb-6 border-b border-slate-100">
            <div className="flex justify-between items-center max-w-md mx-auto">
              {steps.map((s) => (
                <div key={s.n} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                    step >= s.n ? 'bg-[#660033] border-[#660033] text-white' : 'bg-white border-slate-200 text-slate-300'
                  }`}>
                    {step > s.n ? <CheckCircle2 size={16} /> : s.n}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${step >= s.n ? 'text-[#660033]' : 'text-slate-300'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-8 md:p-12 max-w-3xl mx-auto">
          
          {/* STEP 1: SELECT PROFESSIONAL */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Find Your Professional</h2>
                <p className="text-slate-500 font-medium italic">What type of help do you need today?</p>
              </div>

              {!selectedCategory ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-[#660033] hover:shadow-lg hover:shadow-[#660033]/5 transition-all text-center space-y-3 group"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400 group-hover:bg-[#660033]/5 group-hover:text-[#660033] transition-colors">
                        <Users size={24} />
                      </div>
                      <p className="font-bold text-sm text-slate-900">{cat}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-900">Browsing: {selectedCategory}</p>
                    <button onClick={() => setSelectedCategory('')} className="text-xs font-bold text-[#660033] uppercase">Change</button>
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredPros.length === 0 ? (
                      <div className="p-10 text-center text-slate-400 italic bg-white rounded-3xl border border-dashed">
                        No professionals currently available in this category.
                      </div>
                    ) : (
                      filteredPros.map(pro => (
                        <button
                          key={pro.id}
                          onClick={() => { setSelectedPro(pro); nextStep(); }}
                          className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#660033] transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-50">
                               <img src={`https://picsum.photos/seed/${pro.id}/100/100`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-slate-900">{pro.userId}</p>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                <Star size={10} className="fill-amber-400 text-amber-400" /> {pro.rating} • {pro.location?.split(',')[0]}
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-[#660033] group-hover:translate-x-1 transition-all" />
                        </button>
                      ))
                    )}
                    <button 
                      onClick={() => nextStep()}
                      className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-500 rounded-2xl font-bold text-sm hover:border-[#660033]/30 hover:text-[#660033] transition-all"
                    >
                      "I'll decide later, just show me a quote"
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: JOB DETAILS FORM */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Job Requirements</h2>
                <p className="text-slate-500 font-medium">Tell us about the role and your family's needs.</p>
              </div>

              {selectedPro && (
                 <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                   <ShieldCheck className="text-emerald-600" size={20} />
                   <p className="text-sm font-bold text-emerald-800 tracking-tight">Hiring: {selectedPro.userId} ({selectedPro.category})</p>
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferred Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</label>
                  <select 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none"
                  >
                    <option value="">Select Area</option>
                    <option value="Lekki">Lekki</option>
                    <option value="Ikoyi">Ikoyi</option>
                    <option value="Ikeja">Ikeja</option>
                    <option value="VI">Victoria Island</option>
                    <option value="Surulere">Surulere</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Duration</label>
                  <select 
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Temporary">Temporary (Under 1 month)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Living Condition</label>
                  <select 
                    value={formData.livingCondition}
                    onChange={e => setFormData({...formData, livingCondition: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none"
                  >
                    <option value="Live-out">Live-out</option>
                    <option value="Live-in">Live-in</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Tell us about special requirements or requests..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={prevStep} className="px-8 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all flex items-center justify-center gap-2"><ChevronLeft size={20} /> Back</button>
                <button 
                  onClick={nextStep} 
                  disabled={!formData.firstName || !formData.phone || !formData.startDate || !formData.location}
                  className="flex-1 py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all disabled:opacity-50"
                >
                  Confirm Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONSULTATION BOOKING */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Book Consultation</h2>
                <p className="text-slate-500 font-medium">Speak with a Birdie agent to finalize availability.</p>
              </div>

              <div className="bg-[#660033]/5 p-6 rounded-3xl border border-[#660033]/10 space-y-4">
                <div className="flex items-center gap-3 text-[#660033]">
                  <Clock size={20} />
                  <p className="text-sm font-bold uppercase tracking-widest">Available Slots (15 Mins)</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map(time => (
                     <button
                       key={time}
                       onClick={() => setBooking({...booking, time})}
                       className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                         booking.time === time 
                           ? 'bg-[#660033] border-[#660033] text-white shadow-lg shadow-[#660033]/20' 
                           : 'bg-white border-white text-slate-500 hover:border-slate-200'
                       }`}
                     >
                       {time}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <AlertCircle size={14} /> Note: This is an introductory call
                </div>
                <p className="text-sm text-slate-600 px-4 leading-relaxed font-medium">
                  During this call, we will verify the specific availability of your chosen professional and answer any questions about the service agreement.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={prevStep} className="px-8 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all"><ChevronLeft size={20} /></button>
                <button 
                  onClick={nextStep} 
                  disabled={!booking.time}
                  className="flex-1 py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all disabled:opacity-50"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Secure Consultation</h2>
                <p className="text-slate-500 font-medium">Finalize your request with a booking fee.</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-4">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500">Service Category</span>
                    <span className="text-slate-900 font-bold">{selectedCategory}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500">Professional</span>
                    <span className="text-slate-900 font-bold">{selectedPro?.userId || 'General Match'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="text-emerald-600 font-bold">₦{CONSULTATION_FEE.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Due</span>
                    <span className="text-2xl font-bold text-[#660033]">₦{CONSULTATION_FEE.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 justify-center py-2">
                    <ShieldCheck size={16} className="text-[#660033]" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment secured by Paystack</p>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={prevStep} className="px-8 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500"><ChevronLeft size={20} /></button>
                    <button 
                      onClick={handleFinalSubmit}
                      className="flex-1 py-5 bg-[#660033] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#660033]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                      <CreditCard size={20} />
                      Pay & Submit Request
                    </button>
                 </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {step === 5 && (
            <div className="py-12 text-center space-y-10 animate-in zoom-in duration-500">
               <div className="relative">
                 <div className="w-32 h-32 bg-emerald-50 rounded-full mx-auto flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={64} className="text-emerald-500" />
                 </div>
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 border-4 border-emerald-50 rounded-full animate-ping opacity-20" />
               </div>

               <div className="space-y-3">
                 <h2 className="text-4xl font-bold text-slate-900">Request Sent!</h2>
                 <p className="text-slate-500 font-medium max-w-sm mx-auto">Thank you, {formData.firstName}. Your consultation is booked for {booking.time}.</p>
               </div>

               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-sm mx-auto text-left space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reference</span>
                    <span className="text-xs font-bold text-slate-900">#BRD-{(Math.random()*10000).toFixed(0)}</span>
                 </div>
                 <p className="text-xs text-slate-600 font-medium leading-relaxed">
                   A confirmation email has been sent to your inbox. A Birdie representative will call you at the scheduled time to finalize the hire.
                 </p>
               </div>

               <button 
                onClick={onClose}
                className="w-full max-w-sm py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all"
               >
                 Return to Homepage
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HireFlow;
