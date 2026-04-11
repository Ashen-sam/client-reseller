import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { store } from './store/store';
import App from './App';
import ClerkTokenBridge from './components/ClerkTokenBridge';
import './index.css';

const clerkPk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
if (!clerkPk) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to client/.env (see client/.env.example).',
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPk} afterSignOutUrl="/">
      <Provider store={store}>
        <BrowserRouter>
          {/* Must mount before <App/> so the Clerk token getter is registered before RTK Query runs `/me`. */}
          <ClerkTokenBridge />
          <App />
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </StrictMode>,
);
