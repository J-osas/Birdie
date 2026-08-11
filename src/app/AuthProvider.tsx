import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { dataService } from '@/services/dataService';
import { splitName } from '@/lib/utils';
import {
  PlatformSettings,
  ProfessionalProfile,
  User,
  UserRole,
  UserStatus,
  Category,
} from '@/types';

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated' | 'blocked';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  settings: PlatformSettings | null;
  categories: Category[];
  proProfile: ProfessionalProfile | null;
  blockedReason: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  configured: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [proProfile, setProProfile] = useState<ProfessionalProfile | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [platformSettings, cats] = await Promise.all([
        dataService.getPlatformSettings(),
        dataService.getCategories(),
      ]);
      setSettings(platformSettings);
      setCategories(cats);

      if (!isSupabaseConfigured) {
        setStatus('unauthenticated');
        setUser(null);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        setStatus('unauthenticated');
        setUser(null);
        setProProfile(null);
        setBlockedReason(null);
        return;
      }

      const dbProfile = await authService.getProfile(session.user.id);
      if (!dbProfile) {
        setStatus('unauthenticated');
        setUser(null);
        return;
      }

      const { firstName, lastName } = splitName(dbProfile.full_name || '');
      const nextUser: User = {
        id: dbProfile.id,
        firstName,
        lastName,
        name: dbProfile.full_name,
        email: dbProfile.email || session.user.email || '',
        phone: dbProfile.phone || '',
        role: (dbProfile.role?.toLowerCase() || 'client') as UserRole,
        status: (dbProfile.status?.toLowerCase() || 'active') as UserStatus,
        emailVerified: Boolean(session.user.email_confirmed_at),
        avatarUrl: (dbProfile.avatar_url as string) || undefined,
        deletedAt: (dbProfile.deleted_at as string) || null,
        createdAt: dbProfile.created_at,
        updatedAt: dbProfile.updated_at || new Date().toISOString(),
      };

      if (nextUser.deletedAt || nextUser.status === UserStatus.SUSPENDED) {
        setUser(nextUser);
        setBlockedReason(
          nextUser.deletedAt
            ? 'This account has been deleted. Contact support if this was a mistake.'
            : 'Your account is frozen. Contact support to restore access.'
        );
        setStatus('blocked');
        setProProfile(null);
        return;
      }

      setBlockedReason(null);
      setUser(nextUser);

      if (nextUser.role === UserRole.PROFESSIONAL) {
        const pro = await dataService.getProfessionalProfile(nextUser.id);
        setProProfile(pro);
      } else {
        setProProfile(null);
      }

      setStatus('authenticated');
    } catch (err) {
      console.error('Auth refresh failed', err);
      setStatus('unauthenticated');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  const value = useMemo(
    () => ({
      status,
      user,
      settings,
      categories,
      proProfile,
      blockedReason,
      refresh,
      configured: isSupabaseConfigured,
      signOut: async () => {
        await authService.signOut();
        setUser(null);
        setProProfile(null);
        setBlockedReason(null);
        setStatus('unauthenticated');
      },
    }),
    [status, user, settings, categories, proProfile, blockedReason, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
