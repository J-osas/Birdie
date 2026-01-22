
import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { ProfessionalStatus, ProfessionalProfile } from '../types';
import { CATEGORIES } from '../constants';

interface Props {
  userName: string;
  onComplete: (data: Partial<ProfessionalProfile>, testScore: number) => void;
}

const ProfessionalOnboarding: React.FC<Props> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: userName.split(' ')[0],
    lastName: userName.split(' ')[1] || '',
    location: '',
    phone: '',
    category: '' as any,
    bio: '',
    idUploaded: false,
    photoUploaded: false,
    certUploaded: false
  });

  const [testActive, setTestActive] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const questions = {
    'Chef': [
      { q: "What is the danger zone for food temperature?", a: ["0°C to 10°C", "5°C to 60°C", "70°C to 100°C"], correct: 1 },
      { q: "How should you store raw meat in a fridge?", a: ["Top shelf", "Middle shelf", "Bottom shelf"], correct: 2 }
    ],
    'Driver': [
      { q: "What does a flashing amber light mean?", a: ["Stop", "Proceed with caution", "Speed up"], correct: 1 },
      { q: "Who has the right of way at a roundabout?", a: ["Traffic entering", "Traffic already inside", "No one"], correct: 1 }
    ],
    'Nanny': [
      { q: "What is the first step when a child is choking?", a: ["Give water", "Back blows", "Lie them down"], correct: 1 },
      { q: "How often should diapers be checked?", a: ["Every 2 hours", "Once a day", "Every 5 hours"], correct: 0 }
    ],
    'Security': [
      { q: "Primary duty of a residential guard is?", a: ["Arresting people", "Deterrence and observation", "Car washing"], correct: 1 },
      { q: "When should you call the police?", a: ["Immediately for any noise", "When a crime is suspected", "Only after a theft"], correct: 1 }
    ],
    'House Help': [
      { q: "Which chemical shouldn't mix with Bleach?", a: ["Water", "Soap", "Ammonia"], correct: 2 },
      { q: "Best way to clean hardwood floors?", a: ["Soaking wet mop", "Damp cloth", "Steel wool"], correct: 1 }
    ],
    'Gardener': [
      { q: "When is the best time to water plants?", a: ["Midday", "Evening/Early Morning", "Night"], correct: 1 },
      { q: "What is mulch used for?", a: ["Killing plants", "Moisture retention", "Decoration only"], correct: 1 }
    ]
  };

  const currentQuestions = questions[formData.category as keyof typeof questions] || questions['House Help'];

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleTestSubmit = () => {
    let score = 0;
    answers.forEach((ans, idx) => {
      if (ans === currentQuestions[idx].correct) score += (100 / currentQuestions.length);
    });
    onComplete(formData, Math.round(score));
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-10 px-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
            step >= i ? 'bg-[#660033] border-[#660033] text-white' : 'bg-white border-slate-200 text-slate-400'
          }`}>
            {step > i ? <CheckCircle2 size={16} /> : i}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i ? 'text-[#660033]' : 'text-slate-300'}`}>
            {['Start', 'Role', 'Verify', 'Skills', 'Review', 'Test'][i-1]}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      {renderStepIndicator()}

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {/* STEP 1: REGISTRATION */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Professional Registration</h1>
              <p className="text-slate-500 font-medium">Let's get your profile started.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033] outline-none" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033] outline-none" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location (Lagos)</label>
              <input 
                placeholder="e.g. Lekki Phase 1" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033] outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
              <input 
                placeholder="+234..." 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033] outline-none" 
              />
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#2B0116] transition-all shadow-lg shadow-[#660033]/20"
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: SERVICE CATEGORY */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Your Expertise</h1>
              <p className="text-slate-500 font-medium">Which service do you specialize in?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.category === cat 
                      ? 'border-[#660033] bg-[#660033]/5 text-[#660033]' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <Briefcase size={20} className="mb-2" />
                  <p className="font-bold text-sm">{cat}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back</button>
              <button 
                onClick={nextStep} 
                disabled={!formData.category}
                className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PERSONAL VERIFICATION */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Personal Verification</h1>
              <p className="text-slate-500 font-medium">Help us build trust with clients.</p>
            </div>
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 text-center space-y-3">
                <Camera size={32} className="mx-auto text-slate-400" />
                <div>
                  <p className="font-bold text-slate-700">Profile Photo</p>
                  <p className="text-xs text-slate-400">Clear face photo, no sunglasses.</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, photoUploaded: true})}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${formData.photoUploaded ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  {formData.photoUploaded ? 'Uploaded ✓' : 'Select File'}
                </button>
              </div>
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 text-center space-y-3">
                <ShieldCheck size={32} className="mx-auto text-slate-400" />
                <div>
                  <p className="font-bold text-slate-700">Government Identification</p>
                  <p className="text-xs text-slate-400">NIN, Voter's Card, or Passport.</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, idUploaded: true})}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${formData.idUploaded ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  {formData.idUploaded ? 'Uploaded ✓' : 'Select File'}
                </button>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back</button>
              <button 
                onClick={nextStep} 
                disabled={!formData.idUploaded || !formData.photoUploaded}
                className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROFESSIONAL VALIDATION */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Professional Validation</h1>
              <p className="text-slate-500 font-medium">Show us your qualifications.</p>
            </div>
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 text-center space-y-3">
              <Award size={32} className="mx-auto text-[#660033]" />
              <div>
                <p className="font-bold text-slate-700">Certificates & Credentials</p>
                <p className="text-xs text-slate-400">Upload any training or skill certificates.</p>
              </div>
              <button 
                onClick={() => setFormData({...formData, certUploaded: true})}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${formData.certUploaded ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                {formData.certUploaded ? 'Uploaded ✓' : 'Select File'}
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">About You / Experience</label>
              <textarea 
                rows={4}
                placeholder="Describe your skills and background..."
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033] outline-none"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back</button>
              <button 
                onClick={nextStep} 
                className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                Review Registration <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & CONFIRM */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Review Summary</h1>
              <p className="text-slate-500 font-medium">Verify your information before submitting.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-400 uppercase">Category</span>
                <span className="font-bold text-[#660033]">{formData.category}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-400 uppercase">Personal Info</span>
                <span className="font-bold text-slate-900">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-400 uppercase">Verification</span>
                <span className="font-bold text-emerald-600">ID & Photo Uploaded</span>
              </div>
              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bio</span>
                <p className="text-sm text-slate-600 italic">"{formData.bio || 'No bio provided'}"</p>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back</button>
              <button 
                onClick={nextStep} 
                className="flex-[2] py-4 bg-[#660033] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#660033]/20"
              >
                Confirm & Start Test <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: APTITUDE TEST */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Aptitude Assessment</h1>
              <p className="text-slate-500 font-medium">Demonstrate your professional knowledge as a {formData.category}.</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Info size={24} /></div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">This test evaluates your suitability for the Birdie network. You cannot skip this step.</p>
            </div>

            {!testActive ? (
              <div className="py-8 text-center space-y-6">
                <div className="w-20 h-20 bg-[#660033]/5 text-[#660033] rounded-full flex items-center justify-center mx-auto">
                  <BookOpen size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Ready to begin?</h3>
                  <p className="text-sm text-slate-400">2 Multiple Choice Questions • 10 Minutes</p>
                </div>
                <button 
                  onClick={() => setTestActive(true)}
                  className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-lg shadow-[#660033]/20"
                >
                  Start Assessment
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                {currentQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-4">
                    <p className="font-bold text-slate-900 text-lg">{qIdx + 1}. {q.q}</p>
                    <div className="space-y-2">
                      {q.a.map((option, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => {
                            const newAns = [...answers];
                            newAns[qIdx] = oIdx;
                            setAnswers(newAns);
                          }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                            answers[qIdx] === oIdx 
                              ? 'border-[#660033] bg-[#660033]/5 text-[#660033]' 
                              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleTestSubmit}
                  disabled={answers.length < currentQuestions.length}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  Submit Assessment
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
