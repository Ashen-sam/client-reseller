/** Set from `ClerkTokenBridge` so RTK Query can attach the session JWT to API requests. */
let tokenGetter: (() => Promise<string | null>) | null = null;
let signOutFn: (() => Promise<void>) | null = null;

export function setClerkTokenGetter(fn: (() => Promise<string | null>) | null): void {
  tokenGetter = fn;
}

export function setClerkSignOut(fn: (() => Promise<void>) | null): void {
  signOutFn = fn;
}

export async function getClerkToken(): Promise<string | null> {
  if (!tokenGetter) return null;
  try {
    return await tokenGetter();
  } catch {
    return null;
  }
}

export async function clerkSignOut(): Promise<void> {
  if (signOutFn) await signOutFn();
}
