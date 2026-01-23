
import React, { useState, useMemo } from 'react';
import { 
  User, 
  ShieldCheck, 
  FileText, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Briefcase,
  Award,
  BookOpen,
  Info,
  Car,
  Utensils,
  Baby,
  Shield,
  Sparkles,
  Leaf,
  MapPin,
  Home,
  Check,
  Loader2
} from 'lucide-react';
import { ProfessionalStatus, ProfessionalProfile } from '../types';
import { CATEGORIES, LAGOS_LOCATIONS } from '../constants';

interface Props {
  userName: string;
  onComplete: (data: Partial<ProfessionalProfile>, testScore: number) => void;
}

const ProfessionalOnboarding: React.FC<Props> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinalSuccess, setShowFinalSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: userName.split(' ')[0],
    lastName: userName.split(' ')[1] || '',
    location: '',
    phone: '',
    category: '' as any,
    bio: '',
    nin: '',
    idUploaded: false,
    photoUploaded: false,
    certUploaded: false,
    proofAddressUploaded: false
  });

  const [assessmentStep, setAssessmentStep] = useState(0); 
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attitudeAnswers, setAttitudeAnswers] = useState({ mistake: '', independence: '' });

  const ROLE_ICONS: Record<string, any> = {
    'Chef': Utensils,
    'Driver': Car,
    'Nanny': Baby,
    'Security': Shield,
    'House Help': Sparkles,
    'Gardener': Leaf
  };

  // VERBATIM CONTENT FROM PROMPT
  const QUESTIONS = {
    general: [
      { 
        id: 'g1', 
        q: "If your supervisor gives you two tasks to complete before noon, what is the best way to handle it?", 
        a: [
          "A. Start both at once so you look busy", 
          "B. Ask which one is more urgent and finish it first", 
          "C. Do the easier one only", 
          "D. Wait for your supervisor to remind you again"
        ], 
        correct: "B. Ask which one is more urgent and finish it first" 
      },
      { 
        id: 'g2', 
        q: "Read this short note and answer the question: 'Madam travelled and asked you to wash the curtains and mop the floor before she returns in the evening.' What should you do first?", 
        a: [
          "A. Mop the floor first", 
          "B. Wash the curtains first", 
          "C. Wait till evening", 
          "D. Ask someone else to do it"
        ], 
        correct: "B. Wash the curtains first" 
      },
      { 
        id: 'g3', 
        q: "If 5 towels are shared among 5 people equally, how many towels does each person get?", 
        a: ["1 towel", "0 towels", "5 towels", "2 towels"], 
        correct: "1 towel" 
      },
      { 
        id: 'g4', 
        q: "Which of these shows someone who can work well without being told every time?", 
        a: [
          "A. Someone who waits to be called", 
          "B. Someone who sees what needs to be done and does it", 
          "C. Someone who avoids extra work", 
          "D. Someone who complains often"
        ], 
        correct: "B. Someone who sees what needs to be done and does it" 
      },
      { 
        id: 'g5', 
        q: "What is the opposite of “dirty”?", 
        a: ["Clean", "Messy", "Old", "Smelly"], 
        correct: "Clean" 
      }
    ],
    situational: [
      { 
        id: 's1', 
        q: "A client tells you she can’t find her ₦2,000 note after you cleaned her sitting room. What is the best action to take?", 
        a: [
          "A. Ignore her and continue your work", 
          "B. Search quietly and pretend you didn’t hear her", 
          "C. Calmly tell her you didn’t see it, then help her search for it", 
          "D. Leave the house immediately"
        ], 
        correct: "C. Calmly tell her you didn’t see it, then help her search for it" 
      },
      { 
        id: 's2', 
        q: "You notice another worker shouting at a child or customer. What should you do?", 
        a: [
          "A. Shout back", 
          "B. Stay calm and report the matter politely to your supervisor", 
          "C. Record it and post online", 
          "D. Pretend you didn’t see anything"
        ], 
        correct: "B. Stay calm and report the matter politely to your supervisor" 
      },
      { 
        id: 's3', 
        q: "You are running late to work because of traffic. What’s the right thing to do?", 
        a: [
          "A. Call your supervisor and explain before time", 
          "B. Arrive quietly without saying anything", 
          "C. Blame someone else", 
          "D. Go back home"
        ], 
        correct: "A. Call your supervisor and explain before time" 
      },
      { 
        id: 's4', 
        q: "A client offers you a gift of money for doing a good job. What should you do first?", 
        a: [
          "A. Thank them politely and inform your supervisor", 
          "B. Refuse it immediately", 
          "C. Collect and hide it", 
          "D. Demand for more"
        ], 
        correct: "A. Thank them politely and inform your supervisor" 
      },
      { 
        id: 's5', 
        q: "If your phone rings while you’re working in a client’s house, what’s the best action?", 
        a: [
          "A. Step aside and answer quickly, then continue work", 
          "B. Keep talking for a long time", 
          "C. Put on loudspeaker", 
          "D. Ignore your duties"
        ], 
        correct: "A. Step aside and answer quickly, then continue work" 
      }
    ],
    role: {
      'House Help': [
        { id: 'h1', q: "When cleaning a client’s room, which should come first?", a: ["A. Dusting before mopping", "B. Mopping before dusting", "C. Spraying air freshener first", "D. Cleaning only what looks dirty"], correct: "A. Dusting before mopping" },
        { id: 'h2', q: "You’re asked to clean the bathroom but there’s no detergent. What’s the best step?", a: ["A. Wait till tomorrow", "B. Inform your supervisor or use safe alternative like soap and disinfectant", "C. Use any chemical available", "D. Skip that task"], correct: "B. Inform your supervisor or use safe alternative like soap and disinfectant" },
        { id: 'h3', q: "What should you do if you break something while cleaning?", a: ["A. Report it immediately and apologize", "B. Hide it quickly", "C. Blame someone else", "D. Leave it broken"], correct: "A. Report it immediately and apologize" },
        { id: 'h4', q: "When cleaning windows, it is safer to…", a: ["A. Stand firmly and use a steady hand", "B. Climb anyhow to reach", "C. Rush the work", "D. Use wet hands on sockets"], correct: "A. Stand firmly and use a steady hand" },
        { id: 'h5', q: "What’s the main reason to keep cleaning materials in one place?", a: ["A. To stay organized and safe"], correct: "A. To stay organized and safe" }
      ],
      'Nanny': [
        { id: 'n1', q: "A baby starts crying uncontrollably. What should you do first?", a: ["A. Check if the baby is hungry, wet, or uncomfortable", "B. Shout “stop crying!”", "C. Call the parents immediately", "D. Ignore it"], correct: "A. Check if the baby is hungry, wet, or uncomfortable" },
        { id: 'n2', q: "When playing with a child, what’s the most important thing to watch out for?", a: ["A. The child’s safety", "B. The toys", "C. The time", "D. Noise level"], correct: "A. The child’s safety" },
        { id: 'n3', q: "How often should a baby’s feeding items be washed?", a: ["A. After every use", "B. Once a day", "C. When they look dirty", "D. Every two days"], correct: "A. After every use" },
        { id: 'n4', q: "If a child gets a minor injury, what should you do?", a: ["A. Clean it and inform the parents immediately", "B. Ignore it", "C. Wait till it gets worse", "D. Hide it"], correct: "A. Clean it and inform the parents immediately" },
        { id: 'n5', q: "What’s the best way to gain a child’s trust?", a: ["A. Be gentle, kind, and patient"], correct: "A. Be gentle, kind, and patient" }
      ],
      'Driver': [
        { id: 'd1', q: "Your client asks you to drive faster but you know it’s risky. What should you do?", a: ["A. Drive carefully and explain that safety comes first", "B. Obey immediately", "C. Argue and stop the car", "D. Ignore her"], correct: "A. Drive carefully and explain that safety comes first" },
        { id: 'd2', q: "What’s the first thing to check before starting a trip?", a: ["A. Fuel, brakes, and tires", "B. Music system", "C. Passenger mood", "D. Air freshener"], correct: "A. Fuel, brakes, and tires" },
        { id: 'd3', q: "What should you do if your car develops a fault while driving?", a: ["A. Park safely and inform your client or supervisor", "B. Continue driving", "C. Abandon the car", "D. Call a friend"], correct: "A. Park safely and inform your client or supervisor" },
        { id: 'd4', q: "What documents must always be in the vehicle?", a: ["A. Driver’s license, insurance, and vehicle papers", "B. Food receipts", "C. Tools only", "D. None"], correct: "A. Driver’s license, insurance, and vehicle papers" },
        { id: 'd5', q: "If a police officer stops you on the road, what should you do?", a: ["A. Stay calm, greet respectfully, and show required papers"], correct: "A. Stay calm, greet respectfully, and show required papers" }
      ],
      'Chef': [
        { id: 'c1', q: "Which of these is most important when cooking for a family?", a: ["A. Cleanliness and good hygiene", "B. Expensive ingredients", "C. Fast cooking", "D. Cooking your favourite meal"], correct: "A. Cleanliness and good hygiene" },
        { id: 'c2', q: "You drop food on the floor while cooking. What should you do?", a: ["A. Throw it away and clean the area", "B. Pick it up and serve it", "C. Ignore it", "D. Hide it"], correct: "A. Throw it away and clean the area" },
        { id: 'c3', q: "What’s the right way to store leftover food?", a: ["A. Cool it, cover it, and keep it in the fridge", "B. Leave it uncovered", "C. Mix it with new food", "D. Throw everything away"], correct: "A. Cool it, cover it, and keep it in the fridge" },
        { id: 'c4', q: "Before touching food, what’s the first step?", a: ["A. Wash your hands properly", "B. Taste the food", "C. Put on gloves only", "D. Wipe with towel"], correct: "A. Wash your hands properly" },
        { id: 'c5', q: "What’s the main reason for using clean utensils?", a: ["A. To prevent sickness and food poisoning"], correct: "A. To prevent sickness and food poisoning" }
      ]
    }
  };

  const currentRoleQuestions = useMemo(() => {
    const cat = formData.category as keyof typeof QUESTIONS.role;
    return QUESTIONS.role[cat] || QUESTIONS.role['House Help'];
  }, [formData.category]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleTestSubmit = async () => {
    setIsSubmitting(true);
    let points = 0;
    
    // Scoring Logic: 1 point per correct answer (15 total)
    QUESTIONS.general.forEach(q => { if (answers[q.id] === q.correct) points += 1; });
    QUESTIONS.situational.forEach(q => { if (answers[q.id] === q.correct) points += 1; });
    currentRoleQuestions.forEach(q => { if (answers[q.id] === q.correct) points += 1; });
    
    // Add 5 points for completing Section 1 (Identity) and Section 6 (Attitude)
    const totalPoints = points + 5;
    const finalScore = Math.round((totalPoints / 20) * 100);
    
    await new Promise(r => setTimeout(r, 2000));
    
    onComplete({
      ...formData,
      status: ProfessionalStatus.UNDER_REVIEW,
      profileCompletion: 100,
      aptitudeScore: finalScore
    }, finalScore);

    setIsSubmitting(false);
    setShowFinalSuccess(true);
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.location && formData.phone;

  if (showFinalSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in zoom-in duration-500 text-center space-y-8">
        <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-500 shadow-lg">
          <CheckCircle2 size={64} />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">🎉 Assessment Complete!</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            Thank you for completing the Birdie Assessment. We have received your profile and will review it within 48 hours.
          </p>
        </div>
        <div className="pt-4"><Loader2 className="animate-spin mx-auto text-[#660033]" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10 px-4 overflow-x-auto pb-4 custom-scrollbar">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              step >= i ? 'bg-[#660033] border-[#660033] text-white' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              {step > i ? <Check size={16} /> : i}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${step >= i ? 'text-[#660033]' : 'text-slate-300'}`}>
              {['Start', 'Role', 'Verify', 'Certify', 'Review', 'Test'][i-1]}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Professional Identity</h1>
              <p className="text-slate-500 font-medium">Please provide your basic contact information.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Base Location (Lagos)</label>
              <select 
                required
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10 font-bold text-slate-700"
              >
                <option value="">Select Neighborhood</option>
                {LAGOS_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Verified Phone Number</label>
              <input required placeholder="+234..." type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#660033]/10" />
            </div>
            <button onClick={nextStep} disabled={!isStep1Valid} className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold shadow-xl">
              Continue <ArrowRight size={18} className="inline ml-1" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Select Your Expertise</h1>
              <p className="text-slate-500 font-medium italic">Which role are you applying for?</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CATEGORIES.map(cat => {
                const Icon = ROLE_ICONS[cat] || Briefcase;
                return (
                  <button key={cat} onClick={() => setFormData({...formData, category: cat})} className={`p-6 rounded-[2rem] border-2 text-center space-y-3 transition-all ${formData.category === cat ? 'border-[#660033] bg-[#660033]/5 text-[#660033]' : 'border-slate-50 bg-slate-50 text-slate-400 grayscale hover:grayscale-0'}`}>
                    <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-all ${formData.category === cat ? 'bg-[#660033] text-white' : 'bg-white text-slate-300'}`}>
                      <Icon size={24} />
                    </div>
                    <p className="font-bold text-xs uppercase tracking-widest">{cat}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400">Back</button>
              <button onClick={nextStep} disabled={!formData.category} className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Identity Verification</h1>
              <p className="text-slate-500 font-medium">Verify your NIN and upload your identification documents.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">National Identification Number (NIN)</label>
                <input type="text" maxLength={11} placeholder="11-digit number" value={formData.nin} onChange={e => setFormData({...formData, nin: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <input type="file" id="photo-up" className="hidden" onChange={() => setFormData({...formData, photoUploaded: true})} />
                  <label htmlFor="photo-up" className="block p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-3 cursor-pointer">
                    <Camera size={24} className="mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-600">Passport Photo</p>
                    <span className={`inline-block text-[10px] px-4 py-1.5 rounded-lg font-bold ${formData.photoUploaded ? 'bg-emerald-500 text-white' : 'bg-white border text-slate-400'}`}>{formData.photoUploaded ? 'Uploaded ✓' : 'Click to Upload'}</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <input type="file" id="id-up" className="hidden" onChange={() => setFormData({...formData, idUploaded: true})} />
                  <label htmlFor="id-up" className="block p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-3 cursor-pointer">
                    <ShieldCheck size={24} className="mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-600">ID Card Scan</p>
                    <span className={`inline-block text-[10px] px-4 py-1.5 rounded-lg font-bold ${formData.idUploaded ? 'bg-emerald-500 text-white' : 'bg-white border text-slate-400'}`}>{formData.idUploaded ? 'Uploaded ✓' : 'Click to Upload'}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400">Back</button>
              <button onClick={nextStep} disabled={!formData.nin || !formData.idUploaded || !formData.photoUploaded} className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold">Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Validation & Experience</h1>
              <p className="text-slate-500 font-medium">Tell us about your professional background.</p>
            </div>
            <div className="space-y-6">
               <div className="p-8 bg-[#660033]/5 border-2 border-dashed border-[#660033]/20 rounded-[2.5rem] text-center space-y-4">
                  <Award size={32} className="mx-auto text-[#660033]" />
                  <div>
                    <p className="text-lg font-bold text-slate-900">Upload Certificates</p>
                    <p className="text-sm text-slate-400 font-medium">Training papers or trade test results.</p>
                  </div>
                  <input type="file" id="cert-up" className="hidden" onChange={() => setFormData({...formData, certUploaded: true})} />
                  <label htmlFor="cert-up" className="inline-block px-10 py-3 bg-[#660033] text-white rounded-2xl font-bold text-sm cursor-pointer">
                    {formData.certUploaded ? 'Document Uploaded ✓' : 'Select File'}
                  </label>
               </div>
               <textarea rows={4} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Describe your experience in 2-3 sentences..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400">Back</button>
              <button onClick={nextStep} className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold">Review</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Final Review</h1>
              <p className="text-slate-500 font-medium italic">Please verify your details before the test.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
               <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
               <p><strong>Role:</strong> {formData.category}</p>
               <p><strong>Location:</strong> {formData.location}</p>
            </div>
            <button onClick={nextStep} className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold">Proceed to Birdie Assessment</button>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-8 animate-in fade-in duration-500">
             {assessmentStep === 0 && (
               <div className="text-center space-y-8 py-10">
                 <div className="w-24 h-24 bg-[#660033]/5 text-[#660033] rounded-[2rem] flex items-center justify-center mx-auto"><BookOpen size={48} /></div>
                 <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-slate-900">BIRDIE Assessment</h2>
                    <p className="text-slate-500 font-medium">Powered by The Hummingbird Company. This 20-point assessment determines your qualification status.</p>
                 </div>
                 <button onClick={() => setAssessmentStep(1)} className="w-full py-5 bg-[#660033] text-white rounded-[1.5rem] font-bold text-lg shadow-xl">Start Now</button>
               </div>
             )}

             {assessmentStep === 1 && (
               <div className="space-y-8">
                  <div className="flex items-center justify-between border-b pb-4">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section 2: General Aptitude</span>
                     <span className="text-xs font-bold text-[#660033]">1 / 4</span>
                  </div>
                  {QUESTIONS.general.map((q) => (
                    <div key={q.id} className="space-y-4">
                      <p className="text-lg font-bold text-slate-900 leading-tight">{q.q}</p>
                      <div className="grid grid-cols-1 gap-3">
                        {q.a.map((opt, idx) => (
                          <button key={idx} onClick={() => setAnswers({...answers, [q.id]: opt})} className={`text-left p-5 rounded-2xl border-2 transition-all font-bold text-sm ${answers[q.id] === opt ? 'bg-[#660033] border-[#660033] text-white' : 'bg-slate-50 border-white text-slate-500'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button disabled={QUESTIONS.general.some(q => !answers[q.id])} onClick={() => setAssessmentStep(2)} className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-lg">Next Section</button>
               </div>
             )}

             {assessmentStep === 2 && (
               <div className="space-y-8">
                  <div className="flex items-center justify-between border-b pb-4">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section 3: Situational Judgment</span>
                     <span className="text-xs font-bold text-[#660033]">2 / 4</span>
                  </div>
                  {QUESTIONS.situational.map((q) => (
                    <div key={q.id} className="space-y-4">
                      <p className="text-lg font-bold text-slate-900 leading-tight">{q.q}</p>
                      <div className="grid grid-cols-1 gap-3">
                        {q.a.map((opt, idx) => (
                          <button key={idx} onClick={() => setAnswers({...answers, [q.id]: opt})} className={`text-left p-5 rounded-2xl border-2 transition-all font-bold text-sm ${answers[q.id] === opt ? 'bg-[#660033] border-[#660033] text-white' : 'bg-slate-50 border-white text-slate-500'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button disabled={QUESTIONS.situational.some(q => !answers[q.id])} onClick={() => setAssessmentStep(3)} className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-lg">Next Section</button>
               </div>
             )}

             {assessmentStep === 3 && (
               <div className="space-y-8">
                  <div className="flex items-center justify-between border-b pb-4">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section 4: {formData.category} Role</span>
                     <span className="text-xs font-bold text-[#660033]">3 / 4</span>
                  </div>
                  {currentRoleQuestions.map((q) => (
                    <div key={q.id} className="space-y-4">
                      <p className="text-lg font-bold text-slate-900 leading-tight">{q.q}</p>
                      <div className="grid grid-cols-1 gap-3">
                        {q.a.map((opt, idx) => (
                          <button key={idx} onClick={() => setAnswers({...answers, [q.id]: opt})} className={`text-left p-5 rounded-2xl border-2 transition-all font-bold text-sm ${answers[q.id] === opt ? 'bg-[#660033] border-[#660033] text-white' : 'bg-slate-50 border-white text-slate-500'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button disabled={currentRoleQuestions.some(q => !answers[q.id])} onClick={() => setAssessmentStep(4)} className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-lg">Final Section</button>
               </div>
             )}

             {assessmentStep === 4 && (
               <div className="space-y-10">
                  <div className="flex items-center justify-between border-b pb-4">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section 6: Attitude</span>
                     <span className="text-xs font-bold text-emerald-600">4 / 4</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-lg font-bold text-slate-900">How do you handle mistakes at work?</p>
                    <textarea rows={3} value={attitudeAnswers.mistake} onChange={e => setAttitudeAnswers({...attitudeAnswers, mistake: e.target.value})} placeholder="Answer briefly..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-lg font-bold text-slate-900">Describe a time when you worked well without being told what to do.</p>
                    <textarea rows={3} value={attitudeAnswers.independence} onChange={e => setAttitudeAnswers({...attitudeAnswers, independence: e.target.value})} placeholder="Answer briefly..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
                  </div>
                  <button disabled={!attitudeAnswers.mistake || !attitudeAnswers.independence || isSubmitting} onClick={handleTestSubmit} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3">
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Finish & Submit Assessment'}
                  </button>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalOnboarding;
