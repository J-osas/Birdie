import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock, Shield, UserRound } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabase';
import { UserRole, UserStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { IMAGES } from '@/data/images';

export default function AccountPage() {
  const { user, refresh, signOut } = useAuth();
  const isPro = user?.role === UserRole.PROFESSIONAL;
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.name || `${user.firstName} ${user.lastName}`.trim());
    setPhone(user.phone || '');
    setAvatarPreview(user.avatarUrl || '');
  }, [user]);

  if (!user) return null;

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      let avatarUrl = user.avatarUrl;
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
      await authService.updateProfile(user.id, {
        full_name: displayName.trim(),
        phone: phone.trim(),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      });
      await refresh();
      setMessage('Account updated.');
      setAvatarFile(null);
      if (avatarUrl) setAvatarPreview(avatarUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const freeze = async () => {
    if (
      !confirm(
        'Freeze your account? You will be signed out and cannot use Birdie until support restores access.'
      )
    ) {
      return;
    }
    await authService.updateProfile(user.id, { status: UserStatus.SUSPENDED });
    await signOut();
    navigate('/login');
  };

  const softDelete = async () => {
    if (
      !confirm(
        'Delete your account? This cannot be undone from the app. You will be signed out immediately.'
      )
    ) {
      return;
    }
    const typed = prompt('Type DELETE to confirm:');
    if (typed !== 'DELETE') return;
    await authService.updateProfile(user.id, {
      status: UserStatus.SUSPENDED,
      deleted_at: new Date().toISOString(),
    });
    await signOut();
    navigate('/login');
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">
          {isPro ? 'Settings' : 'Account'}
        </p>
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Your profile</h1>
        <p className="text-sm text-[#615A5C] font-medium max-w-2xl">
          {isPro
            ? 'Keep your display name and WhatsApp number current so clients and Birdie ops can reach you. Edit your public bio from the dashboard.'
            : 'Keep your display name and WhatsApp number current so professionals and Birdie ops can reach you.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 md:p-8 space-y-5">
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
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAvatarFile(file);
                    if (file) setAvatarPreview(URL.createObjectURL(file));
                  }}
                />
                <p className="text-[10px] text-slate-400 font-medium">Square photos work best.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-slate-100 text-slate-500" />
                <p className="text-[10px] text-slate-400 font-medium">Email cannot be changed here.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Display name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp number</Label>
                <Input
                  type="tel"
                  placeholder="+234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
            {message && <p className="text-sm font-bold text-emerald-600">{message}</p>}

            <Button onClick={save} disabled={saving || !displayName.trim()}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save changes'}
            </Button>
          </div>

          <div className="bg-white border border-rose-100 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-lg text-[#0A0A0A]">Danger zone</h2>
            <p className="text-sm text-[#615A5C] font-medium">
              Freeze pauses access. Delete soft-deactivates your profile — contact support for permanent removal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={freeze}>
                Freeze account
              </Button>
              <Button variant="danger" onClick={softDelete}>
                Delete account
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] overflow-hidden h-48 border border-slate-200">
            <img src={IMAGES.story} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.75rem] p-6 space-y-4">
            <h2 className="font-bold text-[#0A0A0A]">Why this matters</h2>
            <ul className="space-y-4 text-sm text-[#615A5C] font-medium">
              <li className="flex gap-3">
                <UserRound className="shrink-0 text-[#660033]" size={18} />
                <span>
                  {isPro
                    ? 'Your display name appears on your public profile and hire threads.'
                    : 'Your display name shows on hire requests and reviews you leave.'}
                </span>
              </li>
              <li className="flex gap-3">
                <Shield className="shrink-0 text-[#660033]" size={18} />
                <span>
                  {isPro
                    ? 'WhatsApp helps Birdie and clients confirm schedules quickly.'
                    : 'WhatsApp is how Birdie and professionals confirm schedules quickly.'}
                </span>
              </li>
              <li className="flex gap-3">
                <Lock className="shrink-0 text-[#660033]" size={18} />
                <span>Email stays locked for login security. Contact support to change it.</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#660033] text-white rounded-[1.75rem] p-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Quick links</p>
            <div className="flex flex-col gap-2 text-sm font-bold">
              {isPro ? (
                <>
                  <Link to="/app" className="underline underline-offset-4">
                    Professional dashboard
                  </Link>
                  <Link to="/app/profile" className="underline underline-offset-4">
                    Public profile
                  </Link>
                  <Link to="/app/hires" className="underline underline-offset-4">
                    Your jobs
                  </Link>
                  <Link to="/app/wallet" className="underline underline-offset-4">
                    Payments
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/app" className="underline underline-offset-4">
                    Find professionals
                  </Link>
                  <Link to="/app/hires" className="underline underline-offset-4">
                    Your hires
                  </Link>
                </>
              )}
              <Link to="/terms" className="underline underline-offset-4 text-white/80">
                Terms of use
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
