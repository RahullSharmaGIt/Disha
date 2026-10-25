/**
 * Holland Codes (RIASEC) dimension definitions.
 * Used for quiz scoring and career matching.
 */
export const RIASEC_DIMENSIONS = {
  realistic: {
    code: 'R',
    label: 'Realistic (Doers)',
    description: 'Practical, hands-on work with tools, software systems, machines, or nature',
    keywords: ['practical', 'technical', 'hands-on', 'building', 'systems'],
  },
  investigative: {
    code: 'I',
    label: 'Investigative (Thinkers)',
    description: 'Research, scientific analysis, problem-solving, and intellectual discovery',
    keywords: ['analytical', 'scientific', 'research', 'logic', 'mathematical'],
  },
  artistic: {
    code: 'A',
    label: 'Artistic (Creators)',
    description: 'Creative self-expression, design, visual arts, writing, and communication',
    keywords: ['creative', 'expressive', 'design', 'writing', 'media'],
  },
  social: {
    code: 'S',
    label: 'Social (Helpers)',
    description: 'Helping, teaching, counseling, healthcare, and working with people',
    keywords: ['empathy', 'teaching', 'mentorship', 'healthcare', 'counseling'],
  },
  enterprising: {
    code: 'E',
    label: 'Enterprising (Persuaders)',
    description: 'Leadership, entrepreneurship, business strategy, and persuasion',
    keywords: ['leadership', 'business', 'management', 'strategy', 'negotiation'],
  },
  conventional: {
    code: 'C',
    label: 'Conventional (Organizers)',
    description: 'Data management, structured processes, finance, and system organization',
    keywords: ['organized', 'structured', 'finance', 'accuracy', 'data'],
  },
} as const;

export type RIASECDimension = keyof typeof RIASEC_DIMENSIONS;

// Career cluster to primary RIASEC dimensions mapping
export const CLUSTER_RIASEC_MAP: Record<string, RIASECDimension[]> = {
  'engineering-technology': ['realistic', 'investigative'],
  'medicine-healthcare': ['investigative', 'social'],
  'business-commerce': ['enterprising', 'conventional'],
  'law': ['enterprising', 'social'],
  'design': ['artistic', 'realistic'],
  'government-civil-services': ['social', 'conventional'],
  'data-science-ai': ['investigative', 'conventional'],
  'creative-arts-media': ['artistic', 'social'],
};
