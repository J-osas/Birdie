import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Copy, Loader2, Lock, X } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Availability, HireRequest, ProfessionalProfile, ProfessionalStatus } from '@/types';
import { CATEGORIES, LAGOS_LOCATIONS, DEFAULT_CONSULTATION_FEE } from '@/data/constants';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, TextArea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function HireFlowPage() {
  const { user, settings, status } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const preselectedId = params.get('pro') || undefined;

  const [step, setStep] = useState(1);
  const [pros, setPros] = useState<ProfessionalProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPro, setSelectedPro] = useState<ProfessionalProfile | undefined>();
  const [loading, setLoading] = useState(false);
  const [hireId, setHireId] = useState<string | null>(null);
  const [createdHire, setCreatedHire] = useState<HireRequest | null>(null);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    startDate: '',
    location: '',
    duration: 'Full-time',
    livingCondition: 'LIVE_OUT',
    experienceLevel: '',
    notes: '',
    consultationDate: '',
    consultationTime: '10:00',
    escrowAmount: '',
  });

  const fee = settings?.consultation_fee_ngn ?? DEFAULT_CONSULTATION_FEE;

  useEffect(() => {
    dataService.getPublicProfessionals().then(async (list) => {
      setPros(list);
      if (preselectedId) {
        const found = list.find((p) => p.id === preselectedId) || (await dataService.getProfessionalById(preselectedId));
        if (found) {
          setSelectedPro(found);
          setSelectedCategory(found.category);
          setStep(user ? 3 : 2);
        }
      }
    });
  }, [preselectedId, user]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || f.phone,
      }));
    }
  }, [user]);

  const availablePros = useMemo(
    () =>
      pros.filter(
        (p) =>
          p.category === selectedCategory &&
          (p.availability === Availability.AVAILABLE || p.status === ProfessionalStatus.VERIFIED || p.status === ProfessionalStatus.PENDING)
      ),
    [pros, selectedCategory]
  );

  const requireAuth = () => {
    if (status !== 'authenticated' || !user) {
      navigate(`/login?next=/hire${preselectedId ? `?pro=${preselectedId}` : ''}`);
      return false;
    }
    return true;
  };

  const submitHire = async () => {
    if (!requireAuth() || !user) return;
    setLoading(true);
    try {
      const hire = await dataService.createHireRequest({
        clientId: user.id,
        clientName: `${form.firstName} ${form.lastName}`,
        clientEmail: form.email,
        clientPhone: form.phone,
        professionalId: selectedPro?.id,
        professionalName: selectedPro?.fullName,
        serviceCategory: selectedCategory || selectedPro?.category || 'House Help',
        serviceRequested: `Domestic Support (${selectedCategory || selectedPro?.category})`,
        location: form.location || 'Lagos',
        preferredStartDate: form.startDate || new Date().toISOString(),
        notes: form.notes,
        consultationDate: form.consultationDate,
        consultationTime: form.consultationTime,
        requirements: {
          duration: form.duration,
          livingCondition: form.livingCondition,
          experienceLevel: form.experienceLevel,
          notes: form.notes,
        },
      });
      setHireId(hire.id);
      setCreatedHire(hire);
      setStep(5);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Failed to create hire request. Please try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const payConsultation = async () => {
    if (!hireId) return;
    setLoading(true);
    try {
      const result = await dataService.initializePaystackPayment({
        hireRequestId: hireId,
        paymentType: 'consultation',
      });
      if (!result?.authorization_url) throw new Error('Paystack did not return a checkout link.');
      window.location.href = result.authorization_url;
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not start Paystack checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (settings && settings.hires_enabled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFB]">
        <div className="max-w-md bg-white p-10 rounded-[2rem] border border-slate-200 text-center space-y-4">
          <h1 className="text-2xl font-bold">We are not taking new requests</h1>
          <p className="text-sm text-[#615A5C] font-medium">
            Hiring is paused for now. You can still look at people, and we will open requests again soon.
          </p>
          <Link to="/professionals" className="text-sm font-bold text-[#660033]">
            See people on Birdie
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg bg-white rounded-[2.5rem] border border-slate-200 p-12 text-center space-y-6 shadow-2xl">
          <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
          <h1 className="text-3xl font-bold">We got your payment</h1>
          {createdHire?.referenceCode && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your request number</p>
              <p className="font-mono font-black text-xl text-[#660033] mt-1">{createdHire.referenceCode}</p>
            </div>
          )}
          <p className="text-slate-500 font-medium">
            Birdie will call you at the time you picked. After the call we send you one clear bill for the job. Keep this
            number in case you need to ask us anything.
          </p>
          <Link to={createdHire ? `/app/hires/${createdHire.id}` : '/app/hires'}>
            <Button size="lg">See my request</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#660033]">Getting help</p>
            <h1 className="text-2xl font-bold text-slate-900">Step {step} of 5</h1>
          </div>
          <Link to="/professionals" className="text-slate-400 hover:text-slate-700">
            <X size={22} />
          </Link>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">What kind of help do you need?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCategory(c)}
                    className={`p-5 rounded-2xl border-2 font-bold text-sm ${
                      selectedCategory === c ? 'border-[#660033] bg-[#660033]/5 text-[#660033]' : 'border-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Button disabled={!selectedCategory} onClick={() => setStep(2)} className="w-full" size="lg">
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Pick the person you want</h2>
              <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                {availablePros.map((pro) => {
                  const verified =
                    pro.status === ProfessionalStatus.VERIFIED || pro.status === ProfessionalStatus.APPROVED;
                  return (
                    <button
                      key={pro.id}
                      type="button"
                      onClick={() => setSelectedPro(pro)}
                      className={`w-full text-left p-4 rounded-2xl border-2 flex gap-4 items-center ${
                        selectedPro?.id === pro.id ? 'border-[#660033] bg-[#660033]/5' : 'border-slate-100'
                      }`}
                    >
                      <img
                        src={pro.avatarUrl || '/images/avatar-placeholder.svg'}
                        className="w-14 h-14 rounded-xl object-cover"
                        alt=""
                      />
                      <div className="flex-1">
                        <p className="font-bold">{pro.fullName || 'A Birdie professional'}</p>
                        <p className="text-xs text-slate-500">{pro.location}</p>
                      </div>
                      {verified ? (
                        <Badge tone="success">Checked</Badge>
                      ) : (
                        <Badge tone="warning">Being checked</Badge>
                      )}
                    </button>
                  );
                })}
                {availablePros.length === 0 && (
                  <p className="text-slate-400 font-medium italic">
                    Nobody is free for this kind of work yet. Try another one.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-[2]"
                  disabled={!selectedPro}
                  onClick={() => {
                    if (!user) {
                      requireAuth();
                      return;
                    }
                    setStep(3);
                  }}
                >
                  {user ? 'Next: tell us about the job' : 'Sign in to keep going'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-3xl font-bold">Tell us about the job</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>When would you like them to start?</Label>
                  <Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Where do you live?</Label>
                  <Select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                    <option value="">Pick your area</option>
                    {LAGOS_LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>How much work is it?</Label>
                  <Select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>One-off</option>
                    <option>Live-in</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Where will they sleep?</Label>
                  <Select value={form.livingCondition} onChange={(e) => setForm({ ...form, livingCondition: e.target.value })}>
                    <option value="LIVE_OUT">They go home each day</option>
                    <option value="LIVE_IN">They stay in the house</option>
                    <option value="BQ">They stay in the boys’ quarters</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Anything else we should know?</Label>
                <TextArea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Duties, hours, children, pets, anything at all…"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>When can we call you?</Label>
                  <Input
                    type="date"
                    value={form.consultationDate}
                    onChange={(e) => setForm({ ...form, consultationDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>What time?</Label>
                  <Select value={form.consultationTime} onChange={(e) => setForm({ ...form, consultationTime: e.target.value })}>
                    {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(preselectedId ? 1 : 2)}>
                  Back
                </Button>
                <Button
                  className="flex-[2]"
                  disabled={!form.startDate || !form.consultationDate}
                  onClick={submitHire}
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Send my request'}
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Pay the meeting fee</h2>
              <p className="text-slate-500 font-medium">
                You pay this once for this request. After you pay, we call you at the time you picked, agree everything,
                and then send you one clear bill for the job.
              </p>
              {createdHire && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your request number</p>
                      <p className="font-mono font-black text-lg text-[#660033] mt-1">
                        {createdHire.referenceCode || 'Getting a number…'}
                      </p>
                    </div>
                    {createdHire.referenceCode && (
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        onClick={() => void navigator.clipboard.writeText(createdHire.referenceCode)}
                      >
                        <Copy size={14} /> Copy
                      </Button>
                    )}
                  </div>
                  <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional</dt>
                      <dd className="font-bold text-[#0A0A0A] mt-0.5">
                        {createdHire.professionalName || 'We will match you'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kind of help</dt>
                      <dd className="font-medium text-slate-700 mt-0.5">{createdHire.serviceCategory}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your area</dt>
                      <dd className="font-medium text-slate-700 mt-0.5">{createdHire.location}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Start date</dt>
                      <dd className="font-medium text-slate-700 mt-0.5">
                        {form.startDate || createdHire.preferredStartDate.slice(0, 10)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">How much work</dt>
                      <dd className="font-medium text-slate-700 mt-0.5">{form.duration}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">We call you</dt>
                      <dd className="font-medium text-slate-700 mt-0.5">
                        {form.consultationDate} at {form.consultationTime}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
              <div className="bg-[#660033] text-white p-10 rounded-[2.125rem] space-y-4">
                <div className="flex justify-between text-sm opacity-70 font-bold uppercase tracking-widest">
                  <span>What for</span>
                  <span>Meeting fee</span>
                </div>
                <div className="flex justify-between text-3xl font-black">
                  <span>To pay now</span>
                  <span>{formatNaira(fee)}</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest">
                  <Lock size={14} /> Safe card payment with Paystack
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={payConsultation} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : `Pay ${formatNaira(fee)} with Paystack`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
