import Link from "next/link";
import { LensDemo } from "@/components/home/LensDemo";
import { ScanForm } from "@/components/scan/ScanForm";
import { Icon, type IconName } from "@/components/ui/Icon";

const LENSES: { icon: IconName; verb: string; title: string; body: string }[] = [
  { icon: "speech", verb: "Listen", title: "Screen reader", body: "The page, spoken in document order, with every unnamed control called out." },
  { icon: "eye", verb: "See", title: "Vision", body: "Color blindness, blur, and washed-out contrast, beside the original." },
  { icon: "keyboard", verb: "Tab", title: "Keyboard", body: "The Tab path drawn on the page. Traps and invisible focus marked." },
  { icon: "hand", verb: "Tap", title: "Motor and touch", body: "Targets too small for a tremor, a stylus, or a thumb on a moving bus." },
  { icon: "sparkle", verb: "Mend", title: "Fixes", body: "Draft alt text, labels, and patches. Nothing ships until you accept it." },
];

export default function HomePage() {
  return (
    <>
      <section className="stage" aria-labelledby="hero-title">
        <div className="stage-inner">
          <div className="hero-copy">
            <p className="eyebrow">An instrument, not a badge</p>
            <h1 id="hero-title">
              Put your site
              <br />
              <em>through glass.</em>
            </h1>
            <p className="lede">
              Lens is a camera for how a page is actually used: heard in order, seen without relying on color, walked
              with Tab, hit with a thumb. Then it drafts the missing words.
            </p>
            <div className="scan-card">
              <ScanForm />
            </div>
            <p className="hero-alt">
              Or look through one already loaded: <Link href="/r/demo">example report</Link>
            </p>
          </div>
          <LensDemo />
        </div>
      </section>

      <section className="strip" aria-labelledby="lenses-title">
        <p className="eyebrow">Five plates</p>
        <h2 id="lenses-title">One page, five ways through it</h2>
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
          <p>A button with no name is a locked door.</p>
          <p>Color is not a caption.</p>
          <p>Focus you cannot see is a path you lose.</p>
        </blockquote>
      </section>

      <section className="how" aria-labelledby="how-title">
        <p className="eyebrow">How it works</p>
        <h2 id="how-title">Load a page. Look twice. Mend what snags.</h2>
        <ol className="steps">
          <li>
            <h3>Drop in a URL</h3>
            <p>Any public page, or a snippet of HTML. No account.</p>
          </li>
          <li>
            <h3>Switch plates</h3>
            <p>Listen, squint, Tab, and tap the same layout.</p>
          </li>
          <li>
            <h3>Keep the drafts you trust</h3>
            <p>Each barrier comes with the WCAG rule and a fix you review.</p>
          </li>
        </ol>
        <p>
          <Link href="/r/demo" className="cta-link">
            Open the loaded example <Icon name="arrow" size={20} />
          </Link>
        </p>
      </section>
    </>
  );
}
