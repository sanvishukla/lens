import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const body = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "900"],
  style: ["normal", "italic"],
});
const mono = Atkinson_Hyperlegible_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Lens · Web Accessibility Audit & Simulation", template: "%s · Lens" },
  description:
    "Free, open-source accessibility audit and simulation tool: experience your site through screen readers, color vision deficiency simulations, keyboard navigation, and touch target checks.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="brand">
              <span className="logo-mark" aria-hidden="true" />
              Lens<span className="visually-hidden">, home</span>
            </Link>
            <nav aria-label="Main">
              <ul>
                <li>
                  <Link href="/r/demo">Example</Link>
                </li>
                <li>
                  <Link href="/accessibility">Accessibility</Link>
                </li>
                <li>
                  <Link href="/login">Sign in</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <div className="spectrum-bar" aria-hidden="true" />
          <div className="wrap footer-inner">
            <p className="footer-brand">
              <span className="logo-mark" aria-hidden="true" /> Lens
            </p>
            <p>
              Automated checks identify many accessibility barriers, but cannot replace testing with real assistive technology users. Pair automated tools with testing by people who rely on screen readers, keyboards, and switch devices every day.
            </p>
            <p>
              <Link href="/accessibility">Accessibility statement and feedback</Link>
              {" · "}
              <a href="https://github.com/">Source code (MIT)</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
