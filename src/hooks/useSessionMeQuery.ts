import { useAuth } from '@clerk/clerk-react';
import { useGetMeQuery } from '../store/api';

/**
 * Fetches `/api/auth/me` only when Clerk has finished loading and the user is signed in.
 */
export function useSessionMeQuery(options?: { refetchOnMountOrArgChange?: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  const skip = !isLoaded || !isSignedIn;
  return useGetMeQuery(undefined, {
    skip,
    refetchOnMountOrArgChange: options?.refetchOnMountOrArgChange ?? true,
  });
}
