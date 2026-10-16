"use client";

import { useRef, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const NOT_CONFIGURED = "Sign-in isn't set up on this copy of Lens yet. You can still scan without an account.";

function describe(err: unknown): string {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return NOT_CONFIGURED;
  return err instanceof Error ? err.message : "Something went wrong. Try again.";
}

export function LoginForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setFormError(null);
    const email = emailRef.current?.value.trim() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Enter an email address like name@example.com.");
      emailRef.current?.focus();
      return;
    }
    setFieldError(null);
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo() },
      });
      if (error) throw error;
      setStatus(`We sent a sign-in link to ${email}. It expires in one hour.`);
    } catch (err) {
      setFormError(describe(err));
    }
  }

  async function signInWithGitHub() {
    setFormError(null);
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: redirectTo() },
      });
      if (error) throw error;
    } catch (err) {
      setFormError(describe(err));
    }
  }

  return (
    <>
      <div role="alert">{formError && <p className="error">{formError}</p>}</div>
      <p role="status">{status}</p>

      <form onSubmit={sendMagicLink} noValidate>
        <div className="form-row">
          <label htmlFor="login-email">Email</label>
          <p id="login-email-hint" className="hint">
            We&apos;ll email you a link. No password needed.
          </p>
          {fieldError && (
            <p id="login-email-error" className="error">
              <span className="visually-hidden">Error: </span>
              {fieldError}
            </p>
          )}
          <input
            ref={emailRef}
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? "login-email-hint login-email-error" : "login-email-hint"}
          />
        </div>
        <button type="submit">Email me a sign-in link</button>
      </form>

      <h2>Or use another account</h2>
      <button type="button" className="secondary" onClick={signInWithGitHub}>
        Continue with GitHub
      </button>
    </>
  );
}
