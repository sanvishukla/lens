import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="sheet">
      <h1>Sign in</h1>
      <p className="lede">You can run audits without an account. Sign in if you would like to save reports to your history.</p>
      <LoginForm />
    </div>
  );
}
