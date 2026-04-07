import { SignIn } from '@clerk/clerk-react';

const clerkAuthAppearance = {
  elements: {
    rootBox: 'clerk-root-box',
    card: 'clerk-card',
    footerActionLink: 'clerk-link',
    formButtonPrimary: 'clerk-primary-btn',
    socialButtonsBlockButton: 'clerk-social-btn',
  },
};

export default function LoginPage() {
  return (
    <div className="container auth-page auth-page--clerk-only">
      <div className="auth-card auth-card--clerk-only">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/register"
          fallbackRedirectUrl="/"
          appearance={clerkAuthAppearance}
        />
      </div>
    </div>
  );
}
