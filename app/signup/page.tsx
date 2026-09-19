import { Suspense } from "react";
import SignupScreen from "@/frontend/components/screens/SignupScreen";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupScreen />
    </Suspense>
  );
}
