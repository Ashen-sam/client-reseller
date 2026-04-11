import { useAuth, useClerk } from '@clerk/clerk-react';
import { useLayoutEffect, useEffect, useRef } from 'react';
import { setClerkSignOut, setClerkTokenGetter } from '../lib/clerkTokenBridge';
import { useAppDispatch } from '../store/hooks';
import { api } from '../store/api';

/**
 * Registers Clerk `getToken` / `signOut` for the API client (must render under `ClerkProvider` + Redux `Provider`).
 * Uses `useLayoutEffect` so the getter exists before child `useEffect` hooks (e.g. RTK Query) fire.
 */
export default function ClerkTokenBridge() {
  const dispatch = useAppDispatch();
  const { getToken, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const wasSignedIn = useRef(false);

  useLayoutEffect(() => {
    setClerkTokenGetter(() => getToken());
    setClerkSignOut(() => signOut());
    return () => {
      setClerkTokenGetter(null);
      setClerkSignOut(null);
    };
  }, [getToken, signOut]);

  // Bust stale `/me` only when the user *just* signed in — not on every mount while signed in
  // (that caused extra refetches and races with the session token).
  useEffect(() => {
    if (isSignedIn) {
      if (!wasSignedIn.current) {
        dispatch(api.util.invalidateTags(['Auth']));
      }
      wasSignedIn.current = true;
    } else {
      wasSignedIn.current = false;
    }
  }, [isSignedIn, dispatch]);

  return null;
}
