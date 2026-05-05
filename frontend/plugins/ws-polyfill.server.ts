import ws from 'ws';

export default defineNuxtPlugin(() => {
  if (process.server && typeof globalThis.WebSocket === 'undefined') {
    // Node 20 does not provide a global WebSocket implementation.
    // Supabase Realtime expects one unless transport is explicitly provided.
    globalThis.WebSocket = ws as any;
  }
});
