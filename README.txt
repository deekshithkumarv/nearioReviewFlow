NEARIO REVIEWFLOW - STATIC FILES

Each file is a complete page. No build step, no dependencies.

  index.html       Marketing website (home page)
  feedback.html    Customer feedback page (QR / tap destination)
  dashboard.html   Business owner dashboard + Agency view (switch at the top)
  onboarding.html  New business setup + plan + QR code
  admin.html       Neario team admin panel (keep private)
  privacy.html     Privacy page (linked from website and feedback page)
  terms.html       Terms page (linked from website)

DEPLOY (any one of these)
  Netlify:            drag the folder onto app.netlify.com/drop
  Cloudflare Pages:   Create project > Direct upload > upload the folder
  GitHub Pages:       push the files to a repo, Settings > Pages
  Vercel:             run "vercel" inside this folder

BEFORE YOU GO LIVE - FILL THESE IN
  1. privacy.html and terms.html: replace the orange "[add your support email]"
     and "[add number of days]" markers with real details.
  2. Have a lawyer read privacy.html and terms.html. They are plain-language
     drafts, not legal advice.
  3. onboarding.html and dashboard.html: the QR link uses
     https://feedback.example.com/ . Replace it with your real domain
     (search for "feedback.example.com").
  4. admin.html has no login. Do not put it on a public address until it does.

PRICING AND OFFER
  Monthly Rs 599 per month. Yearly Rs 5,391 in one bill (9 months paid, first 3
  months free, 12 months of use). No GST added. Yearly: full refund within 7 days.
  Search for 5,391 and 599 to change prices. If you register for GST later,
  update index.html, onboarding.html, terms.html and admin.html.

AGENCY MODEL
  Neario (you, super admin) > Agencies > Client businesses. Direct clients have
  no agency. Every client has its own login and pays Neario directly. The agency
  name appears on reports and QR cards next to Neario. admin.html has an Agencies
  tab and a view-as log.
  IMPORTANT FOR THE BACKEND: an agency must only ever read data for the
  businesses assigned to it, never another agency's. Enforce this on the server
  for every request. Record every "view as client" open in a log.

WHAT IS REAL AND WHAT IS NOT
  All pages are front-end prototypes with example data. Nothing is saved.
  WhatsApp alerts, Google Business Profile, AI replies, payments, logins and
  the database need a backend.
  Printing (print kit, reports) works when the file is opened in a normal browser.
  Fonts load from Google Fonts, so pages need internet to look right.
