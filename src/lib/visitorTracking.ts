import { supabase } from './supabase';

async function generateVisitorId(): Promise<string> {
  const stored = localStorage.getItem('visitor_id');
  if (stored) return stored;

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    String(new Date().getTimezoneOffset()),
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
  ].join('|');

  const msgBuffer = new TextEncoder().encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  const visitorId = `v_${hashHex.substring(0, 32)}`;
  localStorage.setItem('visitor_id', visitorId);
  return visitorId;
}

export async function trackVisitor(): Promise<void> {
  try {
    if (!supabase) return; // Supabase not configured in this build → no-op

    const visitorId = await generateVisitorId();

    const { data: existing, error: selectError } = await supabase
      .from('visitors')
      .select('id, visit_count')
      .eq('visitor_id', visitorId)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking visitor:', selectError);
      return;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('visitors')
        .update({
          last_visit: new Date().toISOString(),
          visit_count: (existing.visit_count ?? 0) + 1,
        })
        .eq('visitor_id', visitorId);

      if (updateError) console.error('Error updating visitor:', updateError);
      return;
    }

    const { error: insertError } = await supabase.from('visitors').insert({
      visitor_id: visitorId,
      first_visit: new Date().toISOString(),
      last_visit: new Date().toISOString(),
      visit_count: 1,
    });

    if (insertError) console.error('Error inserting visitor:', insertError);
  } catch (error) {
    console.error('Error tracking visitor:', error);
  }
}

export async function getVisitorCount(): Promise<number> {
  try {
    if (!supabase) return 0;

    const { data, error } = await supabase
      .from('site_stats')
      .select('unique_visitors')
      .maybeSingle();

    if (error) {
      console.error('Error fetching visitor count:', error);
      return 0;
    }

    return data?.unique_visitors ?? 0;
  } catch (error) {
    console.error('Error fetching visitor count:', error);
    return 0;
  }
}
