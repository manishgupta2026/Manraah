import { Suspense } from "react";
import LoginScreen from "@/frontend/components/screens/LoginScreen";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <LoginScreen />
    </Suspense>
  );
}
