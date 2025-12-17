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
    if (!supabase) return;

    const visitorId = await generateVisitorId();
    const now = new Date().toISOString();

    // 1 row per visitor_id (unique). Repeat visits update last_visit but do NOT add rows.
    const { error } = await supabase
      .from('visitors')
      .upsert(
        { visitor_id: visitorId, last_visit: now },
        { onConflict: 'visitor_id' }
      );

    if (error) console.error('Error upserting visitor:', error);
  } catch (e) {
    console.error('Error tracking visitor:', e);
  }
}

export async function getVisitorCount(): Promise<number> {
  try {
    if (!supabase) return 0;

    // Count rows = unique visitors
    const { count, error } = await supabase
      .from('visitors')
      .select('visitor_id', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching visitor count:', error);
      return 0;
    }

    return count ?? 0;
  } catch (e) {
    console.error('Error fetching visitor count:', e);
    return 0;
  }
}
