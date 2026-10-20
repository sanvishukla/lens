import Link from "next/link";
import { LensDemo } from "@/components/home/LensDemo";
import { ScanForm } from "@/components/scan/ScanForm";
import { Icon, type IconName } from "@/components/ui/Icon";

const LENSES: { icon: IconName; verb: string; title: string; body: string }[] = [
  { icon: "speech", verb: "Listen", title: "Screen reader", body: "Spoken in document order, identifying missing labels, broken hierarchies, and unnamed controls." },
  { icon: "eye", verb: "See", title: "Vision", body: "Simulate color vision deficiencies, low contrast, and blur side-by-side with your design." },
  { icon: "keyboard", verb: "Tab", title: "Keyboard", body: "Trace navigation order directly on the page, highlighting keyboard traps and missing focus rings." },
  { icon: "hand", verb: "Tap", title: "Touch & motor", body: "Spot interactive targets too small to tap accurately with a touch screen, stylus, or motor tremor." },
  { icon: "sparkle", verb: "Fix", title: "Remediations", body: "Review AI-assisted alt text, accessible labels, and code patches before applying them." },
];

export default function HomePage() {
  return (
    <>
      <section className="stage" aria-labelledby="hero-title">
        <div className="stage-inner">
          <div className="hero-copy">
            <p className="eyebrow">Comprehensive Accessibility Auditing</p>
            <h1 id="hero-title">
              Experience your site
              <br />
              <em>through every lens.</em>
            </h1>
            <p className="lede">
              Lens reveals how your page is truly experienced: heard through a screen reader, navigated with a keyboard,
              viewed with color vision deficiencies, and tapped on touch screens. Then it drafts intelligent fixes for what is missing.
            </p>
            <div className="scan-card">
              <ScanForm />
            </div>
            <p className="hero-alt">
              Or explore an interactive preview: <Link href="/r/demo">view sample report</Link>
            </p>
          </div>
          <LensDemo />
        </div>
      </section>

      <section className="strip" aria-labelledby="lenses-title">
        <p className="eyebrow">Interactive Perspectives</p>
        <h2 id="lenses-title">One interface, five dimensions of accessibility</h2>
        <ul className="verb-strip">
          {LENSES.map((lens) => (
            <li key={lens.verb}>
              <span className="verb">{lens.verb}</span>
              <span className="feature-icon">
                <Icon name={lens.icon} size={28} />
              </span>
              <h3>{lens.title}</h3>
              <p>{lens.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="manifesto" aria-labelledby="why-title">
        <h2 id="why-title" className="visually-hidden">
          What Lens is for
        </h2>
        <blockquote>
          <p>A button without a name is a locked door.</p>
          <p>Color alone cannot convey meaning.</p>
          <p>Focus you cannot see leaves users lost.</p>
        </blockquote>
      </section>

      <section className="how" aria-labelledby="how-title">
        <p className="eyebrow">How it works</p>
        <h2 id="how-title">Audit your page. Understand the barriers. Apply verified fixes.</h2>
        <ol className="steps">
          <li>
            <h3>Enter a URL or HTML</h3>
            <p>Scan any public page or paste HTML directly. No account required.</p>
          </li>
          <li>
            <h3>Inspect through each lens</h3>
            <p>Evaluate screen reader reading order, vision simulations, keyboard navigation, and tap targets.</p>
          </li>
          <li>
            <h3>Review and apply fixes</h3>
            <p>Every barrier is mapped to its WCAG criterion, accompanied by AI-assisted remediation drafts.</p>
          </li>
        </ol>
        <p>
          <Link href="/r/demo" className="cta-link">
            Explore sample report <Icon name="arrow" size={20} />
          </Link>
        </p>
      </section>
    </>
  );
}
