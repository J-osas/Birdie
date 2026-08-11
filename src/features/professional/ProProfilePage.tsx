import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Lock, Shield, Award, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { Availability, ProfessionalStatus, ReviewStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import { IMAGES } from '@/data/images';
import {
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  RATE_UNIT_OPTIONS,
  SKILL_OPTIONS,
  WORK_TYPE_OPTIONS,
} from '@/data/profileOptions';
import { supabase } from '@/lib/supabase';

type CertRow = {
  id: string;
  title: string;
  verification_status: string;
  created_at: string;
};

export default function ProProfilePage() {
  const { user, proProfile, refresh } = useAuth();
  const [bioDraft, setBioDraft] = useState('');
  const [gender, setGender] = useState('');
  const [rate, setRate] = useState('');
  const [rateUnit, setRateUnit] = useState<'monthly' | 'daily' | 'hourly'>('monthly');
  const [yearsExperience, setYearsExperience] = useState('0');
  const [workType, setWorkType] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verified =
    proProfile?.status === ProfessionalStatus.VERIFIED ||
    proProfile?.status === ProfessionalStatus.APPROVED;

  const loadCerts = async () => {
    if (!proProfile) return;
    const rows = await dataService.getAllCertificationsForPro(proProfile.id);
    setCerts(rows as CertRow[]);
  };

  useEffect(() => {
    if (!proProfile) return;
    setBioDraft(proProfile.bio || '');
    setGender(proProfile.gender || '');
    setRate(proProfile.indicativeRateNgn != null ? String(proProfile.indicativeRateNgn) : '');
    setRateUnit(proProfile.rateUnit || 'monthly');
    setYearsExperience(String(proProfile.yearsExperience ?? 0));
    setWorkType(proProfile.workType || '');
    setLanguages(proProfile.languages || []);
    setSkills(proProfile.skills || []);
    setCity(proProfile.city || '');
    setState(proProfile.state || '');
    setLocation(proProfile.location || '');
    setLat(proProfile.lat ?? null);
    setLng(proProfile.lng ?? null);
    setAvatarPreview(proProfile.avatarUrl || '');
    loadCerts();
  }, [proProfile?.id]);

  const toggleChip = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const setAvailability = async (availability: Availability) => {
    if (!user || !verified) return;
    await dataService.updateProfessionalProfile(user.id, { availability });
    await refresh();
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return;
    }
    setGeoLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoLoading(false);
        setMessage('Map pin updated from your device location.');
      },
      (err) => {
        setGeoLoading(false);
        setError(err.message || 'Could not read location.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const saveProfile = async () => {
    if (!user || !verified) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      let avatarUrl = proProfile?.avatarUrl;
      if (avatarFile) {
        const path = `${user.id}/avatar.jpg`;
        const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, avatarFile, {
          upsert: true,
          contentType: avatarFile.type || 'image/jpeg',
        });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
        avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const rateNum = rate.trim() === '' ? null : Number(rate);
      if (rate.trim() !== '' && (Number.isNaN(rateNum) || (rateNum != null && rateNum < 0))) {
        throw new Error('Enter a valid indicative rate, or leave it blank.');
      }

      const displayLocation =
        location.trim() || [city.trim(), state.trim()].filter(Boolean).join(', ') || 'Lagos';

      await dataService.updateProfessionalProfile(user.id, {
        bio: bioDraft,
        gender,
        indicativeRateNgn: rateNum,
        rateUnit,
        yearsExperience: Number(yearsExperience) || 0,
        workType: workType as '' | 'live_in' | 'live_out' | 'part_time' | 'flexible',
        languages,
        skills,
        city: city.trim(),
        state: state.trim(),
        location: displayLocation,
        lat,
        lng,
        ...(avatarUrl ? { avatarUrl } : {}),
      });
      await refresh();
      setAvatarFile(null);
      if (avatarUrl) setAvatarPreview(avatarUrl);
      setMessage('Public profile saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const uploadCert = async () => {
    if (!user || !proProfile || !verified || !certFile || !certTitle.trim()) return;
    const path = `${user.id}/cert-${Date.now()}-${certFile.name}`;
    const { error: upErr } = await supabase.storage.from('pro-certifications').upload(path, certFile, {
      upsert: true,
    });
    if (upErr) {
      alert(upErr.message);
      return;
    }
    await dataService.addCertification(proProfile.id, certTitle.trim(), path);
    setCertTitle('');
    setCertFile(null);
    await loadCerts();
    setMessage('Certification uploaded for review.');
  };

  if (!user || !proProfile) {
    return <div className="text-sm text-slate-500 font-medium">Loading profile…</div>;
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Profile</p>
          <h1 className="text-3xl font-bold text-[#0A0A0A] mt-1">Public professional profile</h1>
          <p className="text-sm text-[#615A5C] font-medium mt-1 max-w-xl">
            Edit what clients see on your public page — rate, location, skills, and more.
          </p>
        </div>
        <Link to={`/professionals/${proProfile.id}`}>
          <Button size="sm" variant="secondary">
            <ExternalLink size={14} className="mr-1.5" /> View public profile
          </Button>
        </Link>
      </div>

      {!verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-[1.75rem] p-5 text-sm text-amber-900 font-medium flex items-center gap-2">
          <Lock size={16} /> Profile editing unlocks after Birdie verifies you. You can still preview your public page.
        </div>
      )}

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <img
                src={avatarPreview || IMAGES.avatarFallback}
                alt=""
                className="w-24 h-24 rounded-full object-cover border border-slate-200"
              />
              <div className="space-y-2 flex-1">
                <Label>Profile photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={!verified}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAvatarFile(file);
                    if (file) setAvatarPreview(URL.createObjectURL(file));
                  }}
                />
                <p className="text-[10px] text-slate-400 font-medium">Square photos work best on your public hero.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {verified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Pending verification</Badge>}
              <Badge tone="brand">{proProfile.category}</Badge>
              <Badge tone="brand">Assessment {proProfile.assessmentScore ?? 0}%</Badge>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-lg">Basics clients see</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={gender} disabled={!verified} onChange={(e) => setGender(e.target.value)}>
                  {GENDER_OPTIONS.map((o) => (
                    <option key={o.value || 'empty'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Work type</Label>
                <Select value={workType} disabled={!verified} onChange={(e) => setWorkType(e.target.value)}>
                  {WORK_TYPE_OPTIONS.map((o) => (
                    <option key={o.value || 'empty'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Indicative rate (NGN)</Label>
                <Input
                  type="number"
                  min={0}
                  disabled={!verified}
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g. 150000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rate unit</Label>
                <Select
                  value={rateUnit}
                  disabled={!verified}
                  onChange={(e) => setRateUnit(e.target.value as 'monthly' | 'daily' | 'hourly')}
                >
                  {RATE_UNIT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Years of experience</Label>
                <Input
                  type="number"
                  min={0}
                  disabled={!verified}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  Listed rate is indicative — final pay is agreed after consultation.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-lg">Availability</h2>
              {!verified && (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Lock size={12} /> Locked
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {[Availability.AVAILABLE, Availability.BUSY, Availability.UNAVAILABLE, Availability.ON_JOB].map((a) => (
                <Button
                  key={a}
                  size="sm"
                  disabled={!verified}
                  variant={proProfile.availability === a ? 'primary' : 'secondary'}
                  onClick={() => setAvailability(a)}
                >
                  {a.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-lg">Public bio</h2>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-4 text-sm font-medium min-h-[140px] disabled:bg-slate-50"
              value={bioDraft}
              disabled={!verified}
              onChange={(e) => setBioDraft(e.target.value)}
              placeholder="Tell clients about your experience, specialties, and working style…"
            />
          </section>

          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-lg">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  disabled={!verified}
                  onClick={() => toggleChip(languages, lang, setLanguages)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors disabled:opacity-50 ${
                    languages.includes(lang)
                      ? 'bg-[#660033] text-white border-[#660033]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#660033]/40'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-lg">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  disabled={!verified}
                  onClick={() => toggleChip(skills, skill, setSkills)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors disabled:opacity-50 ${
                    skills.includes(skill)
                      ? 'bg-[#660033] text-white border-[#660033]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#660033]/40'
                  }`}
                >
                  {skill}
                </button>
              ))}
              {skills
                .filter((s) => !(SKILL_OPTIONS as readonly string[]).includes(s))
                .map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    disabled={!verified}
                    onClick={() => toggleChip(skills, skill, setSkills)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold border bg-[#660033] text-white border-[#660033]"
                  >
                    {skill} ×
                  </button>
                ))}
            </div>
            <div className="flex gap-2">
              <Input
                disabled={!verified}
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add custom skill"
              />
              <Button
                size="sm"
                variant="secondary"
                disabled={!verified || !customSkill.trim()}
                onClick={() => {
                  const v = customSkill.trim();
                  if (v && !skills.includes(v)) setSkills([...skills, v]);
                  setCustomSkill('');
                }}
              >
                Add
              </Button>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-lg">Public location</h2>
            <p className="text-sm text-[#615A5C] font-medium">
              Clients see neighborhood/city only — not your full street address.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>City / neighborhood</Label>
                <Input disabled={!verified} value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input disabled={!verified} value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Display location label</Label>
                <Input
                  disabled={!verified}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lekki, Lagos"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="secondary" disabled={!verified || geoLoading} onClick={captureLocation}>
                {geoLoading ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
                <span className="ml-1.5">Use my location for map</span>
              </Button>
              {lat != null && lng != null && (
                <p className="text-xs font-bold text-slate-500">
                  Pin set · {lat.toFixed(4)}, {lng.toFixed(4)}
                </p>
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-lg">Certifications</h2>
              {!verified && (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Lock size={12} /> Locked
                </span>
              )}
            </div>
            {certs.length > 0 && (
              <ul className="space-y-2">
                {certs.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl px-4 py-3"
                  >
                    <span className="font-bold text-sm text-[#0A0A0A] flex items-center gap-2">
                      <Award size={16} className="text-[#660033]" /> {c.title}
                    </span>
                    <Badge
                      tone={
                        c.verification_status === ReviewStatus.APPROVED || c.verification_status === 'approved'
                          ? 'success'
                          : c.verification_status === 'rejected'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {c.verification_status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            {verified ? (
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    placeholder="e.g. First aid"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Certificate file</Label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button className="sm:col-span-2" onClick={uploadCert} disabled={!certFile || !certTitle.trim()}>
                  Upload for review
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Upload certificates after your profile is verified.</p>
            )}
          </section>

          {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
          {message && <p className="text-sm font-bold text-emerald-600">{message}</p>}

          <Button onClick={saveProfile} disabled={!verified || saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save public profile'}
          </Button>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] overflow-hidden h-44 border border-slate-200">
            <img src={IMAGES.provider} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-[#0A0A0A]">What clients see</h2>
            <ul className="space-y-4 text-sm text-[#615A5C] font-medium">
              <li className="flex gap-3">
                <Shield className="shrink-0 text-[#660033]" size={18} />
                <span>Verification, category, assessment score, and indicative rate.</span>
              </li>
              <li className="flex gap-3">
                <MapPin className="shrink-0 text-[#660033]" size={18} />
                <span>Neighborhood map pin — street address stays private.</span>
              </li>
              <li className="flex gap-3">
                <Award className="shrink-0 text-[#660033]" size={18} />
                <span>Only approved certifications appear publicly.</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#660033] text-white rounded-[1.75rem] p-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Assessment</p>
            <p className="text-4xl font-black">{proProfile.assessmentScore ?? 0}%</p>
            <p className="text-sm text-white/75 font-medium">Read-only after onboarding.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
