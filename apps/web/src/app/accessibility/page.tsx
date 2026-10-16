import type { Metadata } from "next";

export const metadata: Metadata = { title: "Accessibility statement" };

export default function AccessibilityStatementPage() {
  return (
    <div className="sheet">
      <h1>Accessibility statement</h1>
      <p>
        Lens finds barriers on other sites, so it has to stay usable itself: with a keyboard, a screen reader, zoom, and
        high contrast. We aim to meet WCAG 2.2 at level AA.
      </p>

      <h2>What we do</h2>
      <ul>
        <li>Every page works with a keyboard alone, with a visible focus indicator.</li>
        <li>Pages use landmarks, a logical heading order, and labelled form fields.</li>
        <li>Status changes (scan progress, AI drafts, saved choices) are announced to screen readers.</li>
        <li>Text and controls meet WCAG contrast ratios in light and dark mode, and the layout works at 320px wide and 400% zoom.</li>
        <li>We respect your system settings for dark mode, reduced motion, and high-contrast (forced colors) mode.</li>
        <li>Each release is checked with axe-core and tested by hand with NVDA and VoiceOver.</li>
      </ul>

      <h2>Known limitations</h2>
      <ul>
        <li>
          Screenshots in the vision, keyboard, and motor lenses are images of other sites. Everything they show is also
          listed as text below them.
        </li>
        <li>The &ldquo;Listen to the page&rdquo; button uses your device&apos;s voice, which may differ from your screen reader.</li>
        <li>AI drafts may be wrong. They are always labelled and never applied without your choice.</li>
      </ul>

      <h2>Tell us about a barrier</h2>
      <p>
        If something in Lens doesn&apos;t work for you, please <a href="https://github.com/">open an issue on GitHub</a>.
        Include the page and what you were trying to do. Accessibility bugs are fixed before new features.
      </p>
    </div>
  );
}
