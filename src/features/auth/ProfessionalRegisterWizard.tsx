import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Loader2, MapPin } from 'lucide-react';
import { authService } from '@/services/authService';
import { dataService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';
import { CATEGORIES, NIGERIA_STATES, PROOF_OF_ADDRESS_TYPES, LAGOS_LOCATIONS } from '@/data/constants';
import { cropToPassportSquare, reverseGeocode } from '@/lib/imageCrop';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, TextArea } from '@/components/ui/Input';
import { useAuth } from '@/app/AuthProvider';

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  neighborhood: string;
  category: string;
  bio: string;
  state: string;
  city: string;
  addressLine: string;
  lat: number | null;
  lng: number | null;
  nin: string;
  proofType: string;
  confirmAccurate: boolean;
  agreeTerms: boolean;
};

const STEPS = ['Personal', 'Details', 'ID docs', 'Review'];

export default function ProfessionalRegisterWizard() {
  const navigate = useNavigate();
  const { refresh, settings } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [govtFile, setGovtFile] = useState<File | null>(null);
  const [ninFile, setNinFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    neighborhood: '',
    category: '',
    bio: '',
    state: 'Lagos',
    city: '',
    addressLine: '',
    lat: null,
    lng: null,
    nin: '',
    proofType: 'utility_bill',
    confirmAccurate: false,
    agreeTerms: false,
  });

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const onAvatar = async (file: File | undefined) => {
    if (!file) return;
    try {
      const blob = await cropToPassportSquare(file);
      setAvatarBlob(blob);
      setAvatarPreview(URL.createObjectURL(blob));
    } catch {
      setError('Could not crop photo. Try another image.');
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const geo = await reverseGeocode(lat, lng);
        set({
          lat,
          lng,
          city: geo.city || form.city,
          state: geo.state || form.state,
          addressLine: geo.address || form.addressLine,
        });
        setGeoLoading(false);
      },
      () => {
        setError('Unable to get location. Please enter address manually.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const upload = async (bucket: string, path: string, file: Blob | File) => {
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
    });
    if (upErr) throw upErr;
    return path;
  };

  const submit = async () => {
    if (settings?.reg_pro_enabled === false) {
      setError('Professional sign-up is closed right now.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signUp(
        form.email,
        form.password,
        form.firstName,
        form.lastName,
        UserRole.PROFESSIONAL
      );

      await authService.updateProfile(user.id, {
        phone: form.phone,
        full_name: `${form.firstName} ${form.lastName}`.trim(),
      });

      let avatarUrl: string | undefined;
      let govtIdPath: string | undefined;
      let proofPath: string | undefined;
      let ninDocPath: string | undefined;

      try {
        if (avatarBlob) {
          const path = `${user.id}/avatar.jpg`;
          await upload('profile-photos', path, avatarBlob);
          const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
          avatarUrl = data.publicUrl;
        }
        if (govtFile) {
          govtIdPath = `${user.id}/govt-${Date.now()}-${govtFile.name}`;
          await upload('pro-documents', govtIdPath, govtFile);
        }
        if (proofFile) {
          proofPath = `${user.id}/proof-${Date.now()}-${proofFile.name}`;
          await upload('pro-documents', proofPath, proofFile);
        }
        if (ninFile) {
          ninDocPath = `${user.id}/nin-${Date.now()}-${ninFile.name}`;
          await upload('pro-documents', ninDocPath, ninFile);
        }
      } catch (e) {
        console.warn('Storage upload deferred', e);
        if (govtFile) govtIdPath = `pending://${govtFile.name}`;
        if (proofFile) proofPath = `pending://${proofFile.name}`;
        if (ninFile) ninDocPath = `pending://${ninFile.name}`;
      }

      const locationLabel = [form.neighborhood || form.city, form.state].filter(Boolean).join(', ');

      await dataService.updateProfessionalProfile(user.id, {
        category: form.category,
        bio: form.bio,
        location: locationLabel,
        phone: form.phone,
        state: form.state,
        city: form.city || form.neighborhood,
        addressLine: form.addressLine,
        country: 'NG',
        lat: form.lat,
        lng: form.lng,
        nin: form.nin,
        avatarUrl,
        govtIdPath,
        proofOfAddressPath: proofPath,
        proofOfAddressType: form.proofType,
        ninDocPath,
        onboardingStep: 'assessment',
        profileCompletion: 70,
        publicVisible: true,
        status: 'pending' as never,
      });

      const pro = await dataService.getProfessionalProfile(user.id);
      if (pro) {
        if (govtIdPath) await dataService.addDocument(pro.id, 'govt_id', govtIdPath);
        if (proofPath) await dataService.addDocument(pro.id, 'proof_of_address', proofPath);
        if (avatarUrl) await dataService.addDocument(pro.id, 'passport_photo', avatarUrl);
      }

      await refresh();
      navigate('/app/assessment');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) {
      return (
        form.firstName &&
        form.lastName &&
        form.phone &&
        form.email &&
        form.password.length >= 8 &&
        form.category
      );
    }
    if (step === 1) {
      return form.bio.length >= 20 && form.state && (form.city || form.neighborhood) && form.addressLine;
    }
    if (step === 2) {
      return avatarBlob && proofFile && govtFile && form.nin.length >= 8 && form.proofType;
    }
    return form.confirmAccurate && form.agreeTerms;
  };

  if (settings && settings.reg_pro_enabled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFB]">
        <div className="max-w-md bg-white p-10 rounded-[2rem] border border-slate-200 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign-up is closed</h1>
          <p className="text-sm text-[#615A5C] font-medium">
            We are not taking new professional applications right now. Please try again later.
          </p>
          <Link to="/" className="text-sm font-bold text-[#660033]">
            Back to Birdie
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex w-14 h-14 bg-[#660033] rounded-2xl items-center justify-center text-white text-2xl font-bold">
            B
          </Link>
          <h1 className="text-3xl font-bold text-[#0A0A0A]">Join as a professional</h1>
          <p className="text-[#615A5C] font-medium">Complete your profile, then take the skills assessment.</p>
        </div>

        <div className="flex justify-between gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  step >= i ? 'bg-[#660033] border-[#660033] text-white' : 'border-slate-200 text-slate-400'
                }`}
              >
                {step > i ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hidden sm:block">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.125rem] p-8 md:p-10 shadow-xl space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl flex gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {step === 0 && (
            <>
              <h2 className="text-2xl font-bold">Personal details</h2>
              <div className="space-y-1.5">
                <Label>Service category</Label>
                <Select value={form.category} onChange={(e) => set({ category: e.target.value })} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>First name</Label>
                  <Input value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Last name</Label>
                  <Input value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp number</Label>
                <Input
                  type="tel"
                  placeholder="+234..."
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Password (min 8)</Label>
                <Input
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(e) => set({ password: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Lagos neighborhood (optional)</Label>
                <Select value={form.neighborhood} onChange={(e) => set({ neighborhood: e.target.value })}>
                  <option value="">Select</option>
                  {LAGOS_LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold">Professional details</h2>
              <div className="space-y-1.5">
                <Label>Bio (shown on public profile)</Label>
                <TextArea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => set({ bio: e.target.value })}
                  placeholder="Tell households about your experience…"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Select value={form.state} onChange={(e) => set({ state: e.target.value })}>
                    {NIGERIA_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => set({ city: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <TextArea rows={2} value={form.addressLine} onChange={(e) => set({ addressLine: e.target.value })} />
              </div>
              <Button type="button" variant="secondary" onClick={useMyLocation} disabled={geoLoading}>
                {geoLoading ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
                Use my current location
              </Button>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Country: Nigeria (NG)</p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold">Identification</h2>
              <div className="space-y-1.5">
                <Label>Passport-style photo</Label>
                <Input type="file" accept="image/*" onChange={(e) => onAvatar(e.target.files?.[0])} />
                <p className="text-xs text-[#615A5C]">Any photo is cropped to a 1×1 passport square for your profile.</p>
                {avatarPreview && (
                  <img src={avatarPreview} alt="Preview" className="w-28 h-28 rounded-2xl object-cover border border-slate-200" />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Proof of address type</Label>
                <Select value={form.proofType} onChange={(e) => set({ proofType: e.target.value })}>
                  {PROOF_OF_ADDRESS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-[#615A5C]">Accepted: utility bill, tenancy letter, or official letter.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Proof of address document</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-1.5">
                <Label>Government-issued ID</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => setGovtFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-1.5">
                <Label>NIN</Label>
                <Input value={form.nin} onChange={(e) => set({ nin: e.target.value })} placeholder="National Identification Number" />
              </div>
              <div className="space-y-1.5">
                <Label>NIN document (optional)</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => setNinFile(e.target.files?.[0] || null)} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold">Review & submit</h2>
              <div className="bg-[#F8FAFB] rounded-2xl p-5 space-y-2 text-sm font-medium text-[#615A5C]">
                <p>
                  <span className="font-bold text-[#0A0A0A]">Name:</span> {form.firstName} {form.lastName}
                </p>
                <p>
                  <span className="font-bold text-[#0A0A0A]">Category:</span> {form.category}
                </p>
                <p>
                  <span className="font-bold text-[#0A0A0A]">WhatsApp:</span> {form.phone}
                </p>
                <p>
                  <span className="font-bold text-[#0A0A0A]">Email:</span> {form.email}
                </p>
                <p>
                  <span className="font-bold text-[#0A0A0A]">Address:</span> {form.addressLine}, {form.city},{' '}
                  {form.state}
                </p>
                <p>
                  <span className="font-bold text-[#0A0A0A]">NIN:</span> {form.nin}
                </p>
              </div>
              <label className="flex items-start gap-3 text-sm font-medium text-[#0A0A0A]">
                <input
                  type="checkbox"
                  checked={form.confirmAccurate}
                  onChange={(e) => set({ confirmAccurate: e.target.checked })}
                  className="mt-1 accent-[#660033]"
                />
                I confirm that all information I provided is correct.
              </label>
              <label className="flex items-start gap-3 text-sm font-medium text-[#0A0A0A]">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => set({ agreeTerms: e.target.checked })}
                  className="mt-1 accent-[#660033]"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#660033] font-bold underline" target="_blank">
                    Terms and Conditions
                  </Link>
                  .
                </span>
              </label>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 ? (
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            ) : (
              <Link to="/register" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Client signup
                </Button>
              </Link>
            )}
            {step < 3 ? (
              <Button type="button" className="flex-[2]" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button type="button" className="flex-[2]" disabled={!canNext() || loading} onClick={submit}>
                {loading ? <Loader2 className="animate-spin" /> : 'Create account'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
