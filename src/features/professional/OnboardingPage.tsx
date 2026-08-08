import { Navigate } from 'react-router-dom';

/** Legacy route — assessment replaced the multi-step onboarding wizard. */
export default function OnboardingPage() {
  return <Navigate to="/app/assessment" replace />;
}
