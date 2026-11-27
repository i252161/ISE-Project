export async function ensureSession(): Promise<void> {
  const me = await fetch('/api/me', { credentials: 'same-origin' });
  if (me.ok) {
    return;
  }
  const created = await fetch('/api/demo/session', { method: 'POST', credentials: 'same-origin' });
  if (!created.ok) {
    throw new Error(`Could not start the demo session (HTTP ${created.status})`);
  }
}
