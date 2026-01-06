import { z } from "zod";

const InputSchema = z.object({
  symptoms: z
    .array(z.string())
    .describe(
      "List of symptoms (e.g., ['loud grinding noise', 'door won't close fully', 'remote not working'])"
    ),
  door_age_years: z
    .number()
    .optional()
    .describe("Approximate age of the garage door in years"),
  door_type: z
    .enum(["single", "double", "unknown"])
    .optional()
    .describe("Type of garage door"),
});

type DiagnosisIssue = {
  name: string;
  description: string;
  cost_range: { min: number; max: number };
  promotion?: string;
  safety_note?: string;
};

type DiagnosisResult = {
  issues: DiagnosisIssue[];
  confidence: number;
  urgency: "emergency" | "soon" | "routine";
  service: "repair" | "maintenance" | "replacement";
  costRange: { min: number; max: number };
  promotion: any | null;
  safetyNote: string | null;
  nextSteps: string[];
};

const DIAGNOSTIC_TREE = {
  symptoms: {
    "won't open": {
      issues: ["broken_spring", "opener_failure", "power_issue"],
      urgency: "emergency" as const,
      service: "repair" as const,
    },
    "won't close": {
      issues: ["sensor_misalignment", "track_obstruction", "broken_spring"],
      urgency: "emergency" as const,
      service: "repair" as const,
    },
    "loud grinding": {
      issues: ["worn_rollers", "track_damage", "lack_lubrication"],
      urgency: "soon" as const,
      service: "maintenance" as const,
    },
    "moves unevenly": {
      issues: ["broken_cable", "worn_rollers", "track_misalignment"],
      urgency: "soon" as const,
      service: "repair" as const,
    },
    "opens partially": {
      issues: ["broken_spring", "opener_limit_settings", "track_obstruction"],
      urgency: "emergency" as const,
      service: "repair" as const,
    },
    "banging noise": {
      issues: ["broken_spring", "loose_hardware", "worn_hinges"],
      urgency: "emergency" as const,
      service: "repair" as const,
    },
    "remote not working": {
      issues: ["dead_battery", "opener_failure", "signal_interference"],
      urgency: "routine" as const,
      service: "repair" as const,
    },
    "weather seal damaged": {
      issues: ["worn_seal", "rodent_damage"],
      urgency: "routine" as const,
      service: "maintenance" as const,
    },
  },

  issues: {
    broken_spring: {
      name: "Broken Spring",
      description: "Torsion or extension spring has snapped",
      cost_range: { min: 150, max: 350 },
      promotion: "spring_special",
      safety_note: "Do not attempt to operate door. Springs under extreme tension.",
    },
    worn_rollers: {
      name: "Worn Rollers",
      description: "Rollers are worn, cracked, or seized",
      cost_range: { min: 100, max: 200 },
      promotion: "tune_up",
    },
    opener_failure: {
      name: "Opener Malfunction",
      description: "Garage door opener motor or circuit board issue",
      cost_range: { min: 150, max: 500 },
      promotion: "opener_special",
    },
    broken_cable: {
      name: "Broken Cable",
      description: "Lift cable has frayed or snapped",
      cost_range: { min: 125, max: 250 },
      safety_note: "Door may fall unexpectedly. Do not use.",
    },
    sensor_misalignment: {
      name: "Safety Sensor Issue",
      description: "Photo-eye sensors misaligned or malfunctioning",
      cost_range: { min: 75, max: 150 },
      promotion: "tune_up",
    },
    track_obstruction: {
      name: "Track Obstruction",
      description: "Debris or damage blocking the door tracks",
      cost_range: { min: 50, max: 150 },
    },
    track_damage: {
      name: "Damaged Track",
      description: "Door track is bent, dented, or misaligned",
      cost_range: { min: 100, max: 300 },
    },
    lack_lubrication: {
      name: "Needs Lubrication",
      description: "Moving parts require maintenance lubrication",
      cost_range: { min: 49, max: 89 },
      promotion: "tune_up",
    },
    track_misalignment: {
      name: "Track Misalignment",
      description: "Tracks are not properly aligned",
      cost_range: { min: 75, max: 200 },
    },
    power_issue: {
      name: "Power Problem",
      description: "Electrical connection or power supply issue",
      cost_range: { min: 50, max: 150 },
    },
    dead_battery: {
      name: "Dead Remote Battery",
      description: "Remote control battery needs replacement",
      cost_range: { min: 10, max: 25 },
    },
    signal_interference: {
      name: "Signal Interference",
      description: "Radio frequency interference affecting remote",
      cost_range: { min: 50, max: 100 },
    },
    opener_limit_settings: {
      name: "Limit Settings Issue",
      description: "Opener limit switches need adjustment",
      cost_range: { min: 75, max: 150 },
    },
    loose_hardware: {
      name: "Loose Hardware",
      description: "Bolts, brackets, or hinges have loosened",
      cost_range: { min: 50, max: 100 },
      promotion: "tune_up",
    },
    worn_hinges: {
      name: "Worn Hinges",
      description: "Door hinges are worn and need replacement",
      cost_range: { min: 75, max: 175 },
    },
    worn_seal: {
      name: "Worn Weather Seal",
      description: "Bottom seal or weather stripping is deteriorated",
      cost_range: { min: 50, max: 150 },
      promotion: "winterization",
    },
    rodent_damage: {
      name: "Rodent Damage",
      description: "Weather seal damaged by rodents",
      cost_range: { min: 75, max: 200 },
    },
  },
};

function analyzeDiagnosis(
  symptoms: string[],
  doorAge?: number
): DiagnosisResult {
  let matchedIssues: Set<string> = new Set();
  let highestUrgency: "routine" | "soon" | "emergency" = "routine";
  let recommendedService: "repair" | "maintenance" | "replacement" = "maintenance";

  // Analyze each symptom
  for (const symptom of symptoms) {
    const symptomLower = symptom.toLowerCase();

    // Find matching diagnostic patterns
    for (const [pattern, diagnosis] of Object.entries(DIAGNOSTIC_TREE.symptoms)) {
      if (symptomLower.includes(pattern)) {
        diagnosis.issues.forEach((issue) => matchedIssues.add(issue));

        // Update urgency to highest level
        const urgencyLevels = { routine: 0, soon: 1, emergency: 2 };
        if (urgencyLevels[diagnosis.urgency] > urgencyLevels[highestUrgency]) {
          highestUrgency = diagnosis.urgency;
        }

        // Update recommended service
        if (diagnosis.service === "repair") recommendedService = "repair";
      }
    }
  }

  // If no matches, default to general diagnosis
  if (matchedIssues.size === 0) {
    matchedIssues.add("opener_failure");
  }

  // Build issue details
  const issues: DiagnosisIssue[] = Array.from(matchedIssues)
    .slice(0, 3) // Limit to top 3 issues
    .map((issueKey) => {
      const issue = DIAGNOSTIC_TREE.issues[issueKey as keyof typeof DIAGNOSTIC_TREE.issues];
      return {
        name: issue.name,
        description: issue.description,
        cost_range: issue.cost_range,
        promotion: 'promotion' in issue ? issue.promotion : undefined,
        safety_note: 'safety_note' in issue ? issue.safety_note : undefined,
      };
    });

  // Calculate combined cost range
  const minCost = Math.min(...issues.map((i) => i.cost_range.min));
  const maxCost = Math.max(...issues.map((i) => i.cost_range.max));

  // Find applicable promotion
  const promotion = issues.find((i) => i.promotion)?.promotion || null;

  // Collect safety warnings
  const safetyWarnings = issues
    .filter((i) => i.safety_note)
    .map((i) => i.safety_note)
    .filter(Boolean);

  return {
    issues,
    confidence: 0.85,
    urgency: highestUrgency,
    service: recommendedService,
    costRange: { min: minCost, max: maxCost },
    promotion: promotion
      ? {
          code: promotion,
          applicable: true,
        }
      : null,
    safetyNote: safetyWarnings.length > 0 ? safetyWarnings[0]! : null,
    nextSteps: [
      highestUrgency === "emergency"
        ? "Call immediately for emergency service"
        : "Schedule a service appointment",
      "Avoid using the door until repaired",
      "Ask about current promotions",
    ],
  };
}

export const diagnoseIssueTool = {
  name: "diagnose_issue",
  metadata: {
    title: "Diagnose Garage Door Issue",
    description:
      "Analyze garage door symptoms to identify likely problems and recommend appropriate service. Use when user describes door behavior, sounds, or malfunctions.",
    inputSchema: InputSchema.shape,
    _meta: {
      "openai/outputTemplate": `${process.env.WIDGET_BASE_URL}/diagnosis-result.html`,
      "openai/toolInvocation/invoking": "Analyzing symptoms...",
      "openai/toolInvocation/invoked": "Diagnosis complete",
    },
  },
  handler: async (input: z.infer<typeof InputSchema>) => {
    const validated = InputSchema.parse(input);
    const diagnosis = analyzeDiagnosis(
      validated.symptoms,
      validated.door_age_years
    );

    return {
      structuredContent: {
        likely_issues: diagnosis.issues,
        confidence: diagnosis.confidence,
        urgency: diagnosis.urgency,
        recommended_service: diagnosis.service,
        estimated_cost_range: diagnosis.costRange,
        applicable_promotion: diagnosis.promotion,
        safety_warning: diagnosis.safetyNote,
        next_steps: diagnosis.nextSteps,
      },
    };
  },
};
