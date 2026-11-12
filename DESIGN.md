# Neario ReviewFlow design guide

The product is a feedback tool for small local businesses in India: salons, clinics, cafés, shops.
It should feel like a well-made tool from a careful small company: warm, plain-spoken, confident.
Not a template, not "AI startup".

## Foundations (all in `app/globals.css`)

- **Type:** loaded with `next/font` (`display: 'optional'`, so a late font never reflows the page). Bricolage Grotesque for headings (`--font-display`, weight 600–700, tight tracking),
  Instrument Sans for everything else (`--font-body`). Use the `--fs-*` scale; don't invent sizes.
  Hindi and Kannada fall back to Noto Sans on the customer feedback page.
- **Colour:** warm paper neutrals (`--paper`, `--surface`, `--surface-2`), ink text (`--ink`,
  `--ink-2`, `--muted`), forest green brand (`--brand`, `--brand-soft`, `--brand-text`), and one
  marigold accent (`--accent`) used only for stars and small highlights. Status colours
  (`--success`, `--warn`, `--danger`, `--info` + `-soft`) only for status. The dark green band
  (`--band`, `--band-ink`) is for one or two emphasis sections and the footer.
  No gradients, no gradient blobs, no glassmorphism, no purple.
- **Dark mode** follows the OS. Never hardcode light colours; always use tokens. Exceptions: printed
  QR cards are always black on white.
- **Space:** 4px scale (`--s-*`). Generous vertical rhythm on marketing pages (sections 80–96px apart
  on desktop, 56–64px on mobile).
- **Shape:** `--r-md` (10px) for buttons and inputs, `--r-lg` (14px) for cards, `--r-xl` only for
  modals and the phone mockup. Pills only for badges and chips. Don't round everything.
- **Elevation:** prefer a 1px `--line` border over shadows. `--sh-2` for raised/hover, `--sh-3` for
  floating layers (modals, toasts).
- **Motion:** 150–400ms, `--ease-out`. Scroll reveals use `Reveal`/`RevealItem` from
  `components/ui/Reveal` (CSS + IntersectionObserver, no library; content already on screen is never hidden,
  so it can't delay first paint). Step transitions use Framer Motion through `m.*` components; Framer is only
  loaded where `MotionProvider` (`components/ui/Motion`) wraps the route: the customer feedback page,
  onboarding and admin. CSS transitions for hover/press. Everything respects `prefers-reduced-motion`.

## Shared pieces

- Classes: `.container`, `.eyebrow`, `.btn` (+ `.btn-primary`, `.btn-ghost`, `.btn-danger`,
  `.btn-sm`, `.btn-lg`, `.btn-block`, `.btn-icon`), `.field`, `.label`, `.hint`, `.field-error`,
  `.input`, `.select`, `.textarea`, `.check`, `.card`, `.card-pad`, `.badge` (+ tones), `.alert`
  (+ tones), `.skeleton`, `.spinner`, `.empty`, `.visually-hidden`.
- Components in `app/components/ui/`: `Logo`, `Modal` (accessible dialog/drawer/bottom sheet),
  `EmptyState`, `Reveal`/`RevealItem`, `MotionProvider` (in `Motion.js`), `Toast` (`showToast(msg, { tone: 'success' | 'error' | 'info' })`).
- Icons: `lucide-react` only, 18–20px, `aria-hidden` when decorative. No emoji as icons.
- Page-specific styles go in a CSS module next to the page (`page.module.css`), using the tokens.

## Layout and composition

- Left-aligned by default. Centre only short, single-purpose moments (success states, empty states).
- Vary section layouts: split text/visual, numbered lists, a single strong band, tables where data is
  tabular. Avoid rows of identical three-up icon cards.
- One primary action per view. Secondary actions are `.btn` or `.btn-ghost`.
- Mobile first. Check 360, 390, 768, 1024, 1440. No horizontal scroll. Touch targets ≥ 44px.

## Writing

- Short, specific, human. Say what happens: "Send feedback", "Create invite link", not "Submit".
- No hype words ("revolutionary", "supercharge", "seamless"), no exclamation marks in UI chrome.
- No made-up numbers or testimonials. Sample data must be labelled as sample.
- Errors say what went wrong and what to do next, and never blame the user.

## Accessibility checklist

Every input has a visible label. Errors are linked with `aria-describedby` and announced
(`role="alert"`). Toggle buttons use `aria-pressed`; tabs use `role="tablist"`/`aria-selected`.
Visible focus on everything. Colour is never the only signal. Text contrast ≥ 4.5:1.
Every page has one `<h1>` and a `<main id="main">` (the skip link targets it).
