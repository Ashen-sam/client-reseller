let tokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: (() => Promise<string | null>) | null): void {
  tokenGetter = getter;
}

export async function getClerkToken(): Promise<string | null> {
  if (!tokenGetter) return null;
  try {
    return await tokenGetter();
  } catch {
    return null;
  }
}
