import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="sheet">
      <h1>Sign in</h1>
      <p className="lede">You can look without an account. Sign in only if you want reports saved to a shelf.</p>
      <LoginForm />
    </div>
  );
}
