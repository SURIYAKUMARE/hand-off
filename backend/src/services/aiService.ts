import { prisma } from '../prisma';

export interface AISuggestionResult {
  category: 'HARDWARE' | 'NETWORK' | 'SOFTWARE' | 'ACCOUNT_ACCESS';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  isUrgentIncident: boolean;
  suggestedAction: string;
  explanation: string;
  suggestedArticles: Array<{
    id: string;
    title: string;
    category: string;
    contentPreview: string;
  }>;
  recommendedTechnician: {
    id: string;
    name: string;
    specialization: string;
    activeWorkload: number;
  } | null;
}

interface HeuristicScore {
  category: 'HARDWARE' | 'NETWORK' | 'SOFTWARE' | 'ACCOUNT_ACCESS';
  score: number;
  matchedKeywords: string[];
}

const CATEGORY_KEYWORDS: Record<'HARDWARE' | 'NETWORK' | 'SOFTWARE' | 'ACCOUNT_ACCESS', string[]> = {
  HARDWARE: [
    'laptop', 'computer', 'pc', 'monitor', 'screen', 'display', 'keyboard', 'mouse',
    'dock', 'docking', 'charger', 'power', 'battery', 'cable', 'hdmi', 'usb', 'port',
    'headset', 'mic', 'microphone', 'webcam', 'printer', 'boot', 'hardware', 'overheating',
    'fan', 'ram', 'cpu', 'macbook', 'dell', 'lenovo', 'turn on', 'power on'
  ],
  NETWORK: [
    'wifi', 'wi-fi', 'internet', 'network', 'vpn', 'ethernet', 'connection', 'disconnected',
    'offline', 'latency', 'ping', 'ip', 'dns', 'gateway', 'router', 'switch', 'firewall',
    'packet loss', 'bandwidth', 'slow internet', 'meeting room wifi'
  ],
  SOFTWARE: [
    'software', 'install', 'update', 'upgrade', 'license', 'licence', 'crash', 'crashing',
    'freeze', 'frozen', 'bug', 'glitch', 'teams', 'slack', 'outlook', 'excel', 'word',
    'office', 'vscode', 'visual studio', 'git', 'github', 'docker', 'browser', 'chrome',
    'firefox', 'app', 'application', 'driver'
  ],
  ACCOUNT_ACCESS: [
    'password', 'login', 'log in', 'signin', 'sign in', 'access', 'permission', 'forbidden',
    'locked', 'lockout', 'unlock', 'mfa', '2fa', 'authenticator', 'reset', 'credentials',
    'sso', 'okta', 'active directory', 'badge', 'new hire', 'onboarding', 'seat', 'role'
  ],
};

const URGENT_TRIGGERS = [
  'meeting in', 'within 30 minutes', 'within an hour', 'critical', 'emergency',
  'production down', 'outage', 'executive', 'ceo', 'board meeting', 'cannot work',
  'entire team', 'customer facing', 'security breach', 'data loss'
];

const HIGH_TRIGGERS = [
  'urgent', 'asap', 'high priority', 'blocked', 'deadline', 'presentation today',
  'client meeting', 'cannot access production', 'server down'
];

export async function analyzeTicketWithAI(
  title: string,
  description: string
): Promise<AISuggestionResult> {
  const combinedText = `${title} ${description}`.toLowerCase();

  // 1. Calculate heuristic category scores
  const categoryScores: HeuristicScore[] = [
    { category: 'HARDWARE', score: 0, matchedKeywords: [] },
    { category: 'NETWORK', score: 0, matchedKeywords: [] },
    { category: 'SOFTWARE', score: 0, matchedKeywords: [] },
    { category: 'ACCOUNT_ACCESS', score: 0, matchedKeywords: [] },
  ];

  for (const catScore of categoryScores) {
    const keywords = CATEGORY_KEYWORDS[catScore.category];
    for (const kw of keywords) {
      if (combinedText.includes(kw)) {
        // Higher weight if found in title
        const inTitle = title.toLowerCase().includes(kw);
        catScore.score += inTitle ? 3 : 1;
        catScore.matchedKeywords.push(kw);
      }
    }
  }

  // Sort by score descending
  categoryScores.sort((a, b) => b.score - a.score);
  const bestCategory = categoryScores[0].score > 0 ? categoryScores[0].category : 'HARDWARE';
  const confidence = categoryScores[0].score > 0
    ? Math.min(0.98, Math.max(0.65, categoryScores[0].score * 0.15))
    : 0.50;

  // 2. Assess Priority
  let assessedPriority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let isUrgentIncident = false;

  const isUrgent = URGENT_TRIGGERS.some((trig) => combinedText.includes(trig));
  const isHigh = HIGH_TRIGGERS.some((trig) => combinedText.includes(trig));

  if (isUrgent) {
    assessedPriority = 'URGENT';
    isUrgentIncident = true;
  } else if (isHigh) {
    assessedPriority = 'HIGH';
  } else if (
    combinedText.includes('when you have time') ||
    combinedText.includes('non urgent') ||
    combinedText.includes('routine') ||
    combinedText.includes('minor')
  ) {
    assessedPriority = 'LOW';
  }

  // 3. Formulate Suggested Action & Rationale
  let suggestedAction = 'Proceed with standard ticket submission.';
  let explanation = `Classified as ${bestCategory} based on contextual relevance`;

  if (categoryScores[0].matchedKeywords.length > 0) {
    explanation += ` to detected terms: "${categoryScores[0].matchedKeywords.slice(0, 4).join('", "')}".`;
  } else {
    explanation += ' using fallback IT service defaults.';
  }

  if (isUrgentIncident) {
    explanation += ' Flagged as URGENT incident due to critical business time-constraint or operational disruption.';
  }

  if (bestCategory === 'HARDWARE') {
    suggestedAction = 'Verify all physical cable connections, test alternative wall outlets or docks, and perform a 30-second hard power-cycle.';
  } else if (bestCategory === 'NETWORK') {
    suggestedAction = 'Toggle Wi-Fi adapter off and on, confirm DNS lease in terminal (ipconfig /renew), or test connection via corporate guest SSID.';
  } else if (bestCategory === 'ACCOUNT_ACCESS') {
    suggestedAction = 'Check self-service SSO portal, verify Caps Lock status, and wait 5 minutes before retrying to prevent temporary lockout.';
  } else if (bestCategory === 'SOFTWARE') {
    suggestedAction = 'Restart the target application, clear local caches, and ensure your operating system has completed recent required patches.';
  }

  // 4. Retrieve matching Knowledge Base articles from DB
  const kbArticles = await prisma.knowledgeArticle.findMany({
    where: {
      isPublished: true,
      OR: [
        { category: bestCategory },
        { title: { contains: title.split(' ')[0] || '' } },
      ],
    },
    take: 3,
    select: {
      id: true,
      title: true,
      category: true,
      content: true,
    },
  });

  const formattedArticles = kbArticles.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    contentPreview: a.content.substring(0, 140) + '...',
  }));

  // 5. Determine recommended technician
  const eligibleTechs = await prisma.user.findMany({
    where: {
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      technicianProfile: {
        status: 'AVAILABLE',
      },
    },
    include: {
      technicianProfile: true,
      assignedTickets: {
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        select: { id: true },
      },
    },
  });

  let recommendedTechnician: AISuggestionResult['recommendedTechnician'] = null;

  if (eligibleTechs.length > 0) {
    // Check specialists first
    const specialists = eligibleTechs.filter(
      (t) => t.technicianProfile?.specialization === bestCategory
    );
    const candidates = specialists.length > 0 ? specialists : eligibleTechs;

    candidates.sort((a, b) => a.assignedTickets.length - b.assignedTickets.length);
    const chosen = candidates[0];

    recommendedTechnician = {
      id: chosen.id,
      name: chosen.name,
      specialization: chosen.technicianProfile?.specialization || 'GENERAL_IT',
      activeWorkload: chosen.assignedTickets.length,
    };
  }

  return {
    category: bestCategory,
    priority: assessedPriority,
    confidence,
    isUrgentIncident,
    suggestedAction,
    explanation,
    suggestedArticles: formattedArticles,
    recommendedTechnician,
  };
}
