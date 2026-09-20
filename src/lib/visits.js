import { supabase } from './supabase';

const KEY = 'aib_visitor_id';

export function trackVisit() {
  let id;
  try {
    id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
  } catch {
    return; // storage blocked (private mode) — skip silently
  }
    supabase
    .rpc('record_visit', { p_visitor: id })
    .then(({ error }) => { if (error) console.error('visit error', error); });
}
