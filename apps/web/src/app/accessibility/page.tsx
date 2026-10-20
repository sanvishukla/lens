import type { Metadata } from "next";

export const metadata: Metadata = { title: "Accessibility statement" };

export default function AccessibilityStatementPage() {
  return (
    <div className="sheet">
      <h1>Accessibility statement</h1>
      <p>
        Lens evaluates accessibility barriers on other sites, so it is vital that our own interface remains fully
        accessible: via keyboard, screen reader, magnification, and high-contrast modes. We aim to conform to WCAG 2.2 Level AA standards.
      </p>

      <h2>What we do</h2>
      <ul>
        <li>Every page operates with a keyboard alone, featuring a clearly visible focus indicator.</li>
        <li>Pages use semantic landmarks, a logical heading hierarchy, and clearly labeled form controls.</li>
        <li>Status changes (scan progress, AI drafts, saved preferences) are announced to screen readers.</li>
        <li>Text and interactive controls meet WCAG contrast ratios in both light and dark modes, supporting layouts at 320px width and 400% zoom.</li>
        <li>We respect system preferences for dark mode, reduced motion, and high-contrast (forced colors) mode.</li>
        <li>Every release is audited with axe-core and manually tested with NVDA and VoiceOver.</li>
      </ul>

      <h2>Known limitations</h2>
      <ul>
        <li>
          Screenshots within the vision, keyboard, and motor lenses are static captures of external sites. All visual findings are also provided in text format directly beneath each image.
        </li>
        <li>The &ldquo;Listen to the page&rdquo; feature uses browser text-to-speech synthesis, which may pronounce content differently than dedicated screen readers like NVDA, JAWS, or VoiceOver.</li>
        <li>AI recommendations are initial drafts. They are explicitly labeled and are never applied to source code without your review and approval.</li>
      </ul>

      <h2>Report an accessibility barrier</h2>
      <p>
        If something in Lens is not working for you, please <a href="https://github.com/">open an issue on GitHub</a>.
        Please include the page URL and the action you were attempting to perform. Accessibility issues are prioritized ahead of new feature work.
      </p>
    </div>
  );
}
