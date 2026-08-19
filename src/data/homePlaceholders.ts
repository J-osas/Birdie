/** Swap these when real proof and quotes exist. Photo keys resolve through the live gallery. */
export const HOME_PROOF = {
  families: '80+',
  familiesLabel: 'Lagos homes helped',
  professionals: '35+',
  professionalsLabel: 'checked professionals',
};

export const HOME_TESTIMONIALS = [
  {
    name: 'Funmi A.',
    role: 'Family in Lekki',
    quote:
      'I used to start over every few months. With Birdie I met someone who had been checked, we agreed the work in one call, and I knew where my money was.',
    photoKey: 'homeTestimonial' as const,
  },
  {
    name: 'Kunle O.',
    role: 'Family in Ikeja',
    quote:
      'The meeting was clear, the bill was clear, and I did not have to chase anyone for trust. That is all I wanted.',
    photoKey: 'homeReach2' as const,
  },
];

export const HOME_PLACEHOLDER_PROS = [
  { id: 'ph-1', fullName: 'Adaeze O.', category: 'Nanny', location: 'Lekki', photoKey: 'homeReach1' as const },
  { id: 'ph-2', fullName: 'Chinedu E.', category: 'Driver', location: 'Ikeja', photoKey: 'homeReach2' as const },
  { id: 'ph-3', fullName: 'Fatima S.', category: 'House Help', location: 'Victoria Island', photoKey: 'homeWhy' as const },
  { id: 'ph-4', fullName: 'Tunde A.', category: 'Chef', location: 'Yaba', photoKey: 'homeHero' as const },
];
