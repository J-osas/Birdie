import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="w-full px-6 md:w-[90vw] md:mx-auto py-16 max-w-3xl space-y-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">The rules</p>
      <h1 className="text-4xl font-bold text-[#0A0A0A]">Our rules, in plain words</h1>
      <p className="text-sm text-[#615A5C] font-medium">
        Last updated March 2026. This is the short, clear version we use while our lawyers finish the long one.
      </p>

      <div className="space-y-6 text-[#615A5C] font-medium leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">1. What Birdie is</h2>
          <p>
            Birdie helps homes in Nigeria find good help. We check people, set up the meeting, and hold the money. We are
            not the boss of the professional unless we have signed something separate that says so.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">2. Your account</h2>
          <p>
            Tell us the truth about who you are. If you want to work through Birdie, you agree to let us check your ID,
            speak to your references and test your skills. If you lie to us, we will close your account.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">3. What you pay</h2>
          <p>
            First you pay a small meeting fee so we can set up the call and match you properly. After the call we agree
            the job, the hours and the price, and we send you one clear bill. You pay that bill with your card. Birdie
            holds your money until the work is done, then pays the professional and keeps a small service fee. The price
            on a profile is only a guide. If your card does not go through, nothing counts as paid. While we still hold
            your money we can send it back. Once it has gone to the professional's bank, we cannot pull it back on our
            own.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">4. How to behave</h2>
          <p>
            No abuse, no cheating, and no going around Birdie to pay in cash while a Birdie job is running. Reviews must
            be honest and about a real job you finished with us: talk about the work, do not insult anybody, do not post
            anyone's private details, and write one review for each job. You can be firm and honest. You cannot be
            abusive. Every review is checked before it goes on a profile.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A0A0A]">5. Talk to us</h2>
          <p>
            Any question at all,{' '}
            <Link to="/contact" className="text-[#660033] font-bold underline">
              send us a message
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
