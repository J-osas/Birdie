import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { screenReviewComment } from './screenReview.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reviews land as "pending". This checks the words and either puts the review
// live or leaves it waiting for a person at Birdie to decide.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { reviewId } = await req.json();
    if (!reviewId) throw new Error('reviewId is required');

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: review, error } = await admin
      .from('reviews')
      .select('id, comment, status, screened_at')
      .eq('id', reviewId)
      .maybeSingle();
    if (error) throw error;
    if (!review) throw new Error('Review not found');

    if (review.status !== 'pending' || review.screened_at) {
      return new Response(JSON.stringify({ status: review.status, alreadyChecked: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // A short pause so the person who wrote it sees that we are checking.
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const reason = screenReviewComment(review.comment || '');
    const patch = reason
      ? { flag_reason: reason, screened_at: new Date().toISOString() }
      : { status: 'published', flag_reason: null, screened_at: new Date().toISOString() };

    const { error: updateError } = await admin.from('reviews').update(patch).eq('id', reviewId);
    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ status: reason ? 'pending' : 'published', flagReason: reason }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
