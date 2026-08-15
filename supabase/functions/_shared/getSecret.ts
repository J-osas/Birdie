import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

type AdminClient = ReturnType<typeof createClient>;

export async function getAppSecret(admin: AdminClient, name: string): Promise<string | null> {
  const fromEnv = Deno.env.get(name);
  if (fromEnv) return fromEnv;
  const { data, error } = await admin.rpc('get_app_secret', { p_name: name });
  if (error || !data) return null;
  return String(data);
}

export async function getPaystackSecret(admin: AdminClient): Promise<string | null> {
  const { data: settings } = await admin
    .from('platform_settings')
    .select('paystack_mode')
    .eq('id', 'global')
    .maybeSingle();
  const mode = settings?.paystack_mode === 'live' ? 'live' : 'test';
  const named = mode === 'live' ? 'PAYSTACK_SECRET_KEY_LIVE' : 'PAYSTACK_SECRET_KEY_TEST';
  return (await getAppSecret(admin, named)) || (await getAppSecret(admin, 'PAYSTACK_SECRET_KEY'));
}

export async function listPaystackSecrets(admin: AdminClient): Promise<string[]> {
  const names = ['PAYSTACK_SECRET_KEY_TEST', 'PAYSTACK_SECRET_KEY_LIVE', 'PAYSTACK_SECRET_KEY'];
  const found: string[] = [];
  for (const name of names) {
    const value = await getAppSecret(admin, name);
    if (value) found.push(value);
  }
  return [...new Set(found)];
}
