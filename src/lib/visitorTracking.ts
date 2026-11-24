
import { supabase } from './supabase';

export async function trackVisitor(): Promise<void> {
  // Direct visitor database writes are disabled.
  return;
}

export async function getVisitorCount(): Promise<number> {
  try {
    if (!supabase) return 0;

    const { data, error } = await supabase.rpc(
      'get_public_visitor_count'
    );

    if (error) {
      console.error('Error fetching visitor count:', error);
      return 0;
    }

    return Number(data ?? 0);
  } catch (error) {
    console.error('Error fetching visitor count:', error);
    return 0;
  }
}
