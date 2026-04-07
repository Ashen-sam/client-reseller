let tokenGetter: ((forceRefresh?: boolean) => Promise<string | null>) | null = null;

export function setClerkTokenGetter(
  getter: ((forceRefresh?: boolean) => Promise<string | null>) | null,
): void {
  tokenGetter = getter;
}

export async function getClerkToken(forceRefresh = false): Promise<string | null> {
  if (!tokenGetter) return null;
  try {
    return await tokenGetter(forceRefresh);
  } catch {
    return null;
  }
}
