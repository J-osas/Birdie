import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="w-full px-6 md:w-[90vw] md:mx-auto py-16 max-w-3xl space-y-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Legal</p>
      <h1 className="text-4xl font-bold text-[#0A0A0A]">Terms of use</h1>
      <p className="text-sm text-[#615A5C] font-medium">Last updated: March 2026 · Placeholder copy for launch — replace with counsel-approved terms.</p>

      <div className="space-y-6 text-[#615A5C] font-medium leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">1. Platform role</h2>
          <p>
            Birdie connects households in Nigeria with vetted domestic professionals. Birdie is a marketplace and
            escrow facilitator, not the employer of professionals unless a separate written agreement says otherwise.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">2. Accounts</h2>
          <p>
            You must provide accurate information. Professionals agree to identity checks, skills assessment, and
            document review. Misrepresentation may lead to suspension or removal.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">3. Fees & escrow</h2>
          <p>
            Clients pay a consultation fee per hire and fund escrow before work starts where required. Platform
            commission and payout rules are shown in-app and may be updated with notice.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">4. Conduct</h2>
          <p>
            Abuse, fraud, off-platform circumvention of escrow for active Birdie hires, or unsafe behaviour is
            prohibited. Reviews must be honest and related to completed work.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">5. Contact</h2>
          <p>
            Questions:{' '}
            <Link to="/contact" className="text-[#660033] font-bold underline">
              Contact Birdie
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
