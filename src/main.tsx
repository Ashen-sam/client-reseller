import { StrictMode } from 'react';
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
  setClerkTokenGetter(async () => (await getToken()) || null);
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
