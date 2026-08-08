export type McQuestion = {
  id: string;
  q: string;
  type: 'mc';
  a: string[];
  correct: string;
};

export type TextQuestion = {
  id: string;
  q: string;
  type: 'text';
  accept: string[];
};

export type AssessmentQuestion = McQuestion | TextQuestion;

export type AttitudePrompt = {
  id: string;
  q: string;
};

/** WordPress Fluent Form “Skilled Workers Assessment” + Security/Gardener banks */
export const ASSESSMENT_QUESTIONS = {
  general: [
    {
      id: 'g1',
      type: 'mc' as const,
      q: 'If your supervisor gives you two tasks to complete before noon, what is the best way to handle it?',
      a: [
        'Start both at once so you look busy',
        'Ask which one is more urgent and finish it first',
        'Do the easier one only',
        'Wait for your supervisor to remind you again',
      ],
      correct: 'Ask which one is more urgent and finish it first',
    },
    {
      id: 'g2',
      type: 'mc' as const,
      q: 'Read this short note and answer the question: “Madam traveled and asked you to wash the curtains and mop the floor before she returns in the evening.” What should you do first?',
      a: ['Mop the floor first', 'Wash the curtains first', 'Wait till evening', 'Ask someone else to do it'],
      correct: 'Wash the curtains first',
    },
    {
      id: 'g3',
      type: 'text' as const,
      q: 'If 5 towels are shared among 5 people equally, how many towels does each person get?',
      accept: ['1', 'one', '1 towel', 'one towel'],
    },
    {
      id: 'g4',
      type: 'mc' as const,
      q: 'Which of these shows someone who can work well without being told every time?',
      a: [
        'Someone who waits to be called',
        'Someone who avoids extra work',
        'Someone who complains often',
        'Someone who sees what needs to be done and does it',
      ],
      correct: 'Someone who sees what needs to be done and does it',
    },
    {
      id: 'g5',
      type: 'text' as const,
      q: 'What is the opposite of “dirty”?',
      accept: ['clean', 'cleanliness'],
    },
  ] as AssessmentQuestion[],

  situational: [
    {
      id: 's1',
      type: 'mc' as const,
      q: 'A client tells you she can’t find her ₦2,000 note after you cleaned her sitting room. What is the best action to take?',
      a: [
        'Ignore her and continue your work',
        'Search quietly and pretend you didn’t hear her',
        'Calmly tell her you didn’t see it, then help her search for it',
        'Leave the house immediately',
      ],
      correct: 'Calmly tell her you didn’t see it, then help her search for it',
    },
    {
      id: 's2',
      type: 'mc' as const,
      q: 'You notice another worker shouting at a child or customer. What should you do?',
      a: [
        'Shout back',
        'Stay calm and report the matter politely to your supervisor',
        'Record it and post online',
        'Pretend you didn’t see anything',
      ],
      correct: 'Stay calm and report the matter politely to your supervisor',
    },
    {
      id: 's3',
      type: 'mc' as const,
      q: 'You are running late to work because of traffic. What’s the right thing to do?',
      a: [
        'Call your supervisor and explain before time',
        'Arrive quietly without saying anything',
        'Blame someone else',
        'Go back home',
      ],
      correct: 'Call your supervisor and explain before time',
    },
    {
      id: 's4',
      type: 'mc' as const,
      q: 'A client offers you a gift of money for doing a good job. What should you do first?',
      a: [
        'Thank them politely and inform your supervisor',
        'Refuse it immediately',
        'Collect and hide it',
        'Demand for more',
      ],
      correct: 'Thank them politely and inform your supervisor',
    },
    {
      id: 's5',
      type: 'mc' as const,
      q: 'If your phone rings while you’re working in a client’s house, what’s the best action?',
      a: [
        'Keep talking for a long time',
        'Put on loudspeaker',
        'Ignore your duties',
        'Step aside and answer quickly, then continue work',
      ],
      correct: 'Step aside and answer quickly, then continue work',
    },
  ] as AssessmentQuestion[],

  role: {
    'House Help': [
      {
        id: 'h1',
        type: 'mc' as const,
        q: 'When cleaning a client’s room, which should come first?',
        a: ['Dusting before mopping', 'Mopping before dusting', 'Spraying air freshener first', 'Cleaning only what looks dirty'],
        correct: 'Dusting before mopping',
      },
      {
        id: 'h2',
        type: 'mc' as const,
        q: 'You’re asked to clean the bathroom but there’s no detergent. What’s the best step?',
        a: [
          'Wait till tomorrow',
          'Inform your supervisor or use safe alternative like soap and disinfectant',
          'Use any chemical available',
          'Skip that task',
        ],
        correct: 'Inform your supervisor or use safe alternative like soap and disinfectant',
      },
      {
        id: 'h3',
        type: 'mc' as const,
        q: 'What should you do if you break something while cleaning?',
        a: ['Report it immediately and apologize', 'Hide it quickly', 'Blame someone else', 'Leave it broken'],
        correct: 'Report it immediately and apologize',
      },
      {
        id: 'h4',
        type: 'mc' as const,
        q: 'When cleaning windows, it is safer to…',
        a: ['Stand firmly and use a steady hand', 'Climb anyhow to reach', 'Rush the work', 'Use wet hands on sockets'],
        correct: 'Stand firmly and use a steady hand',
      },
      {
        id: 'h5',
        type: 'text' as const,
        q: 'What’s the main reason to keep cleaning materials in one place?',
        accept: ['organized', 'organise', 'organize', 'safety', 'safe', 'neat', 'easy to find', 'stay organized'],
      },
    ],
    Nanny: [
      {
        id: 'n1',
        type: 'mc' as const,
        q: 'A baby starts crying uncontrollably. What should you do first?',
        a: [
          'Check if the baby is hungry, wet, or uncomfortable',
          'Shout “stop crying!”',
          'Call the parents immediately',
          'Ignore it and believe it will stop',
        ],
        correct: 'Check if the baby is hungry, wet, or uncomfortable',
      },
      {
        id: 'n2',
        type: 'mc' as const,
        q: 'When playing with a child, what’s the most important thing to watch out for?',
        a: ['The toys', 'The child’s safety', 'The time', 'Noise level'],
        correct: 'The child’s safety',
      },
      {
        id: 'n3',
        type: 'mc' as const,
        q: 'How often should a baby’s feeding items be washed?',
        a: ['Once a day', 'Every two days', 'After every use', 'When they look dirty'],
        correct: 'After every use',
      },
      {
        id: 'n4',
        type: 'mc' as const,
        q: 'If a child gets a minor injury, what should you do?',
        a: ['Wait till it gets worse', 'Clean it and inform the parents immediately', 'Ignore it', 'Hide it'],
        correct: 'Clean it and inform the parents immediately',
      },
      {
        id: 'n5',
        type: 'text' as const,
        q: 'What’s the best way to gain a child’s trust?',
        accept: ['gentle', 'kind', 'patient', 'patience', 'care', 'love', 'respect'],
      },
    ],
    Driver: [
      {
        id: 'd1',
        type: 'mc' as const,
        q: 'Your client asks you to drive faster but you know it’s risky. What should you do?',
        a: [
          'Obey immediately',
          'Argue and stop the car',
          'Drive carefully and explain that safety comes first',
          'Ignore her',
        ],
        correct: 'Drive carefully and explain that safety comes first',
      },
      {
        id: 'd2',
        type: 'mc' as const,
        q: 'What’s the first thing to check before starting a trip?',
        a: ['Fuel, brakes, and tires', 'Music system', 'Passenger mood', 'Air freshener and oil'],
        correct: 'Fuel, brakes, and tires',
      },
      {
        id: 'd3',
        type: 'mc' as const,
        q: 'What should you do if your car develops a fault while driving?',
        a: [
          'Call a friend',
          'Abandon the car',
          'Park safely and inform your client or supervisor',
          'Continue driving',
        ],
        correct: 'Park safely and inform your client or supervisor',
      },
      {
        id: 'd4',
        type: 'mc' as const,
        q: 'What documents must always be in the vehicle?',
        a: [
          'Driver’s license, insurance, and vehicle papers',
          'Toll/parking receipts',
          'Tools only',
          'None',
        ],
        correct: 'Driver’s license, insurance, and vehicle papers',
      },
      {
        id: 'd5',
        type: 'text' as const,
        q: 'If a police officer stops you on the road, what should you do?',
        accept: ['calm', 'respect', 'papers', 'documents', 'license', 'polite', 'cooperate'],
      },
    ],
    Chef: [
      {
        id: 'c1',
        type: 'mc' as const,
        q: 'Which of these is most important when cooking for a family?',
        a: ['Expensive ingredients', 'Cleanliness and good hygiene', 'Fast cooking', 'Cooking your favorite meal'],
        correct: 'Cleanliness and good hygiene',
      },
      {
        id: 'c2',
        type: 'mc' as const,
        q: 'You drop food on the floor while cooking. What should you do?',
        a: ['Throw it away and clean the area', 'Pick it up and serve it', "Don't waste it", 'Hide it'],
        correct: 'Throw it away and clean the area',
      },
      {
        id: 'c3',
        type: 'mc' as const,
        q: 'What’s the right way to store leftover food?',
        a: [
          'Heat it and mix it with new food',
          'Cool it, cover it, and keep it in the fridge',
          'Throw everything away',
          'Leave it uncovered',
        ],
        correct: 'Cool it, cover it, and keep it in the fridge',
      },
      {
        id: 'c4',
        type: 'mc' as const,
        q: 'Before touching food, what’s the first step?',
        a: ['Put on gloves only', 'Wipe with towel', 'Taste the food', 'Wash your hands properly'],
        correct: 'Wash your hands properly',
      },
      {
        id: 'c5',
        type: 'text' as const,
        q: 'What’s the main reason for using clean utensils?',
        accept: ['sickness', 'poison', 'hygiene', 'health', 'germ', 'disease', 'safe', 'contamination'],
      },
    ],
    Security: [
      {
        id: 'sec1',
        type: 'mc' as const,
        q: 'A stranger insists on entering the compound without ID. What should you do?',
        a: [
          'Politely refuse and alert the household/supervisor',
          'Let them in to avoid conflict',
          'Argue loudly at the gate',
          'Ignore them',
        ],
        correct: 'Politely refuse and alert the household/supervisor',
      },
      {
        id: 'sec2',
        type: 'mc' as const,
        q: 'What is the most important habit on duty?',
        a: ['Stay alert and follow access protocols', 'Use your phone often', 'Sleep in shifts secretly', 'Share gate codes freely'],
        correct: 'Stay alert and follow access protocols',
      },
      {
        id: 'sec3',
        type: 'mc' as const,
        q: 'You notice an unusual package at the gate. Best action?',
        a: ['Do not touch it; report immediately', 'Open it to check', 'Throw it away', 'Take it inside'],
        correct: 'Do not touch it; report immediately',
      },
      {
        id: 'sec4',
        type: 'mc' as const,
        q: 'When should visitor details be recorded?',
        a: ['Every time before entry', 'Only at night', 'Only if they look suspicious', 'Never'],
        correct: 'Every time before entry',
      },
      {
        id: 'sec5',
        type: 'mc' as const,
        q: 'If there is an emergency, what comes first?',
        a: [
          'Secure people, follow emergency protocol, then report',
          'Post on social media',
          'Leave the post',
          'Wait until morning',
        ],
        correct: 'Secure people, follow emergency protocol, then report',
      },
    ],
    Gardener: [
      {
        id: 'gar1',
        type: 'mc' as const,
        q: 'Before using a sharp garden tool, what should you do?',
        a: ['Inspect it and use it carefully', 'Use it as-is always', 'Leave it in the rain', 'Share without checking'],
        correct: 'Inspect it and use it carefully',
      },
      {
        id: 'gar2',
        type: 'mc' as const,
        q: 'Chemicals/pesticides should be…',
        a: [
          'Stored safely and used only as instructed',
          'Mixed freely',
          'Left near children',
          'Poured into drains casually',
        ],
        correct: 'Stored safely and used only as instructed',
      },
      {
        id: 'gar3',
        type: 'mc' as const,
        q: 'If plants look diseased, best step?',
        a: [
          'Inform the client/supervisor and follow guidance',
          'Ignore it',
          'Pull everything out immediately',
          'Water more only',
        ],
        correct: 'Inform the client/supervisor and follow guidance',
      },
      {
        id: 'gar4',
        type: 'mc' as const,
        q: 'After gardening, tools should be…',
        a: ['Cleaned and stored properly', 'Left on the lawn', 'Hidden', 'Given away'],
        correct: 'Cleaned and stored properly',
      },
      {
        id: 'gar5',
        type: 'mc' as const,
        q: 'Watering is best done…',
        a: [
          'According to plant needs and schedule',
          'Only when you remember',
          'With boiling water',
          'Never',
        ],
        correct: 'According to plant needs and schedule',
      },
    ],
  } as Record<string, AssessmentQuestion[]>,

  attitude: [
    { id: 'att1', q: 'How do you handle mistakes at work?' },
    { id: 'att2', q: 'Describe a time when you worked well without being told what to do.' },
  ] as AttitudePrompt[],
};

function normalizeText(s: string) {
  return s.trim().toLowerCase().replace(/[^\w\s]/g, '');
}

function textMatches(answer: string, accept: string[]) {
  const n = normalizeText(answer);
  if (!n) return false;
  return accept.some((a) => n.includes(normalizeText(a)) || normalizeText(a) === n);
}

export function questionsForCategory(category: string): AssessmentQuestion[] {
  const role = ASSESSMENT_QUESTIONS.role[category] || ASSESSMENT_QUESTIONS.role['House Help'];
  return [...ASSESSMENT_QUESTIONS.general, ...ASSESSMENT_QUESTIONS.situational, ...role];
}

export function scoreAssessment(
  category: string,
  answers: Record<string, string>
): { scorePercent: number; earned: number; max: number } {
  const qs = questionsForCategory(category);
  let earned = 0;
  let max = 0;
  for (const q of qs) {
    max += 1;
    const ans = answers[q.id] || '';
    if (q.type === 'mc') {
      if (ans === q.correct) earned += 1;
    } else if (textMatches(ans, q.accept)) {
      earned += 1;
    }
  }
  return {
    earned,
    max,
    scorePercent: max ? Math.round((earned / max) * 100) : 0,
  };
}
