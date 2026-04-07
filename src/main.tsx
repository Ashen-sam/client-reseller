import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { store } from './store/store';
import { setClerkTokenGetter } from './lib/clerkToken';
import App from './App';
import './index.css';

const clerkPk = String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim();

function ClerkTokenBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    setClerkTokenGetter(async (forceRefresh?: boolean) => (await getToken({ skipCache: Boolean(forceRefresh) })) || null);
    return () => setClerkTokenGetter(null);
  }, [getToken]);
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      {clerkPk ? (
        <ClerkProvider publishableKey={clerkPk}>
          <BrowserRouter>
            <ClerkTokenBridge />
          </BrowserRouter>
        </ClerkProvider>
      ) : (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )}
    </Provider>
  </StrictMode>
);
