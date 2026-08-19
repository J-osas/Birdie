import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';

const root = path.resolve('docs');
const htmlPath = path.join(root, '_qa-print.html');
const pdfPath = path.join(root, 'Birdie-QA-Hire-Pay-Report.pdf');
const img = (name) => pathToFileURL(path.join(root, 'qa-hire-lifecycle', name)).href;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Birdie QA report — hire and pay lifecycle</title>
  <style>
    @page { size: A4; margin: 16mm 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #1a1416;
      font-size: 11.5pt;
      line-height: 1.45;
      margin: 0;
    }
    h1 { font-size: 22pt; color: #660033; margin: 0 0 8px; letter-spacing: -0.02em; }
    h2 { font-size: 14pt; color: #660033; margin: 22px 0 8px; page-break-after: avoid; }
    p, li { margin: 0 0 8px; }
    .meta { color: #5c5557; font-size: 10pt; margin-bottom: 16px; }
    .meta div { margin: 2px 0; }
    .banner {
      background: #660033;
      color: white;
      padding: 10px 14px;
      font-family: Arial, sans-serif;
      font-size: 10pt;
      margin: 0 0 16px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 10px 0 16px; page-break-inside: avoid; }
    th, td { border: 1px solid #d9d0d3; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f4eef1; color: #660033; font-family: Arial, sans-serif; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.04em; }
    .pass { color: #0f6b3a; font-weight: 700; }
    .blocked { color: #9a1f2e; font-weight: 700; }
    figure { margin: 10px 0 14px; page-break-inside: avoid; }
    figcaption { font-size: 9pt; color: #5c5557; font-family: Arial, sans-serif; margin-top: 4px; }
    img.shot {
      width: 100%;
      max-height: 210mm;
      object-fit: contain;
      object-position: top;
      border: 1px solid #e6dce0;
      background: #f8fafb;
    }
    ul { padding-left: 18px; }
    .footer-note { font-size: 9pt; color: #5c5557; margin-top: 24px; border-top: 1px solid #e6dce0; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>Birdie QA report</h1>
  <p style="font-size:14pt;margin-top:0">Hire and pay lifecycle</p>
  <div class="meta">
    <div><strong>Date:</strong> 18 Aug 2026</div>
    <div><strong>App:</strong> http://localhost:3000 (Vite) · live Birdie database</div>
    <div><strong>Paystack:</strong> Test · <strong>Birdie fee:</strong> 3.5%</div>
    <div><strong>How we tested:</strong> browser screenshots of public pages + database check of money math</div>
  </div>

  <div class="banner">Verdict: the public hire path and the money math work. Signed-in dashboards were not clicked in this pass (no passwords in the repo; new sign-up needs email confirmation).</div>

  <h2>Results</h2>
  <table>
    <thead><tr><th>Step</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td>Home, find people, open a profile</td><td class="pass">Pass</td></tr>
      <tr><td>Hire wizard starts and asks for sign-in</td><td class="pass">Pass</td></tr>
      <tr><td>/app/hires without a session sends you to login</td><td class="pass">Pass (security)</td></tr>
      <tr><td>Register: family vs professional, admin is invite-only</td><td class="pass">Pass</td></tr>
      <tr><td>Contact page shows support email and ₦10,000 meeting fee</td><td class="pass">Pass</td></tr>
      <tr><td>Job done + pay professional on hire BRD-260815-0002</td><td class="pass">Pass (database)</td></tr>
      <tr><td>3.5% Birdie fee (₦2,450 of ₦70,000)</td><td class="pass">Pass</td></tr>
      <tr><td>Professional ready to withdraw ₦67,550</td><td class="pass">Pass</td></tr>
      <tr><td>Withdrawal → Paystack transfer to a bank</td><td class="blocked">Not run — no withdrawal requested, and no login</td></tr>
      <tr><td>Full new hire with test card in this session</td><td class="blocked">Blocked — need a signed-in family</td></tr>
    </tbody>
  </table>

  <h2>Step 1 — Family lands on Birdie</h2>
  <figure>
    <img class="shot" src="${img('01-home.png')}" alt="Home page" />
    <figcaption>Figure 1. Home page</figcaption>
  </figure>
  <p>Home loads. The family is told Birdie checks people and holds money until the job is done. <strong>Find someone to help</strong> is the main action.</p>
  <p><strong>Opinion:</strong> Keep this copy. Do not mention bank names or Paystack on the home hero.</p>

  <h2>Step 2 — Family picks a person</h2>
  <figure>
    <img class="shot" src="${img('02-professionals.png')}" alt="Professionals list" />
    <figcaption>Figure 2. Find someone to help</figcaption>
  </figure>
  <p>Three checked people show. Hire buttons are visible.</p>
  <p><strong>Issues (data, not code):</strong></p>
  <ul>
    <li>Alice’s bio is leftover test typing. Clean that before live.</li>
    <li>Joshua is on a job (old test hire BRD-260811-0001 still active with ₦70,000 held). Finish or refund that hire so he is free again.</li>
    <li>Ratings are 0.0 because no published reviews yet. That is expected.</li>
  </ul>

  <h2>Step 3 — Family reads the profile</h2>
  <figure>
    <img class="shot" src="${img('03-public-profile.png')}" alt="Alice public profile" />
    <figcaption>Figure 3. Alice APro public profile</figcaption>
  </figure>
  <p>Alice is checked, scored 73% on the test, available in Ikoyi. <strong>Hire this person</strong> is clear. Reviews are empty until a job is finished.</p>
  <p><strong>Opinion:</strong> Hide or rewrite dummy bios before families see the live site.</p>

  <h2>Step 4 — Hire wizard, then sign-in wall</h2>
  <figure>
    <img class="shot" src="${img('04-hire-start.png')}" alt="Hire wizard" />
    <figcaption>Figure 4. Hire wizard — pick Alice</figcaption>
  </figure>
  <p>Step 2 of 5: pick Alice. A guest cannot send a request. Button: <strong>Sign in to keep going</strong>.</p>
  <figure>
    <img class="shot" src="${img('04b-hire-redirects-to-login.png')}" alt="Hire redirects to login" />
    <figcaption>Figure 5. Hire wizard sends a guest to sign in</figcaption>
  </figure>
  <p><strong>Opinion:</strong> This is the right security behaviour. Do not let guests create unpaid hires.</p>

  <h2>Step 5 — Sign in / create account</h2>
  <figure>
    <img class="shot" src="${img('05-login.png')}" alt="Login" />
    <figcaption>Figure 6. Sign in</figcaption>
  </figure>
  <figure>
    <img class="shot" src="${img('06-register.png')}" alt="Register" />
    <figcaption>Figure 7. Create an account</figcaption>
  </figure>
  <p>Register offers <strong>I need help</strong> or <strong>I provide help</strong>. Copy says admin is invite-only.</p>
  <p><strong>Blocked here:</strong> a throwaway family was not created. Email confirmation is on, so a new account would not sign in without the inbox.</p>
  <p>To finish this step: sign in as the family, send a hire, pay the meeting fee with test card <strong>4084 0840 8408 4081</strong>.</p>

  <h2>Step 6 — Contact</h2>
  <figure>
    <img class="shot" src="${img('07-contact.png')}" alt="Contact page" />
    <figcaption>Figure 8. Contact page</figcaption>
  </figure>
  <p>Support email support@birdie.ng and meeting fee ₦10,000 show. FAQ includes how to pay and how Birdie keeps money safe.</p>

  <h2>Step 7 — App without login</h2>
  <figure>
    <img class="shot" src="${img('08-app-hires-requires-login.png')}" alt="App requires login" />
    <figcaption>Figure 9. /app/hires while logged out</figcaption>
  </figure>
  <p>Opening /app/hires while logged out sends you to login. Staff and family money pages are not public.</p>

  <h2>Step 8 — Money logic (already completed on this database)</h2>
  <p>Hire <strong>BRD-260815-0002</strong> (Client Demo → Alice APro, ₦70,000) is now <strong>settled / released</strong>.</p>
  <table>
    <thead><tr><th>What happened</th><th>Amount</th><th>Reference ending</th></tr></thead>
    <tbody>
      <tr><td>Family paid, Birdie held it</td><td>₦70,000</td><td>escrow credit</td></tr>
      <tr><td>Job marked done — out of hold</td><td>₦70,000</td><td>_hold_out</td></tr>
      <tr><td>Job marked done — waiting</td><td>₦70,000</td><td>_waiting_in</td></tr>
      <tr><td>Paid out of waiting</td><td>₦70,000</td><td>_waiting_out</td></tr>
      <tr><td>Birdie fee 3.5%</td><td>₦2,450</td><td>_birdie_fee</td></tr>
      <tr><td>Ready for Alice</td><td>₦67,550</td><td>_ready</td></tr>
    </tbody>
  </table>
  <p>Alice’s wallet now: held <strong>0</strong>, waiting <strong>0</strong>, ready <strong>₦67,550</strong>.</p>
  <p><strong>Still open:</strong> no withdrawal has been requested. Alice should ask for ₦67,550, then staff approve on Money. In test mode, check Paystack Transfers — no real bank credit.</p>

  <h2>Security notes from this pass</h2>
  <ul>
    <li>Hire submit and /app pages require a session.</li>
    <li>Public register cannot create admin.</li>
    <li>Paystack secrets are not in the browser. Card checkout is started on the server.</li>
    <li>This was a lifecycle QA, not a full penetration test.</li>
  </ul>

  <h2>What to do next</h2>
  <ol>
    <li>Sign in as family, staff, and Alice (three browsers).</li>
    <li>Finish one new hire with the test card (meeting fee + bill).</li>
    <li>Confirm Held equals the bill, not double.</li>
    <li>Staff: start job → job done → pay professional. Ready = bill minus 3.5%.</li>
    <li>Alice: request withdrawal → staff approve.</li>
    <li>Clean Alice’s bio and close Joshua’s leftover active hire.</li>
  </ol>
  <p class="footer-note">Birdie · QA hire and pay lifecycle · 18 Aug 2026 · Confidential test notes</p>
</body>
</html>
`;

await writeFile(htmlPath, html, 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
});
await browser.close();
console.log('Wrote', pdfPath);
