export const PAYMENT_SHORT =
  'You never hand cash to the professional. You pay Birdie with your card, and Birdie holds the money. First you pay a small meeting fee so we can set up a call and match you properly. After the call we agree the real job — the price, how long it runs and the start date — and we send you a bill. You pay that bill, and Birdie keeps your money safe until the work is done. Then we pay the professional and keep a small service fee. The price on a profile is only a guide, not the final bill.';

export const PAYMENT_FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I pay on Birdie?',
    a: PAYMENT_SHORT,
  },
  {
    q: 'What is the meeting fee?',
    a: 'It is a one-off fee for each request. It pays for Birdie to set up the call, talk through what you need and confirm the job. It is not the professional’s pay. Birdie sets the amount, and today it is ₦10,000.',
  },
  {
    q: 'Who decides how much the job costs?',
    a: 'The price on a profile is a starting point, like "from ₦X a month". After you pay the meeting fee we talk with you about the duties, the hours, live-in or live-out, how long you need someone and the price. We then send you a bill for the amount you agreed. That is the amount you pay.',
  },
  {
    q: 'How does Birdie keep my money safe?',
    a: 'You pay your bill with your card. Birdie holds that money while the work is happening, so the professional cannot take it yet. When the job is done there is a short waiting time. After that we pay the professional and keep our service fee. If something goes wrong, tell us during that waiting time.',
  },
  {
    q: 'What if my card does not work?',
    a: 'Nothing counts as paid until your bank confirms it. You will see a message in the app and get an email. Open the request or your money page and try again. If you need help, give us your request number, for example BRD-260813-0042.',
  },
  {
    q: 'Can I get my money back?',
    a: 'Yes, if the job is called off while Birdie is still holding your money. The meeting fee is different, because that pays for work we have already done, so Birdie decides those case by case. Once the money has gone to the professional’s bank we cannot pull it back on our own.',
  },
];
