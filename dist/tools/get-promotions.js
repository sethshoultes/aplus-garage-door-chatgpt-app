import { z } from "zod";
const InputSchema = z.object({
    service_type: z
        .enum(["repair", "installation", "maintenance", "all"])
        .optional()
        .describe("Filter promotions by service type"),
    issue_type: z
        .string()
        .optional()
        .describe("Specific issue to find applicable promotions (e.g., 'spring', 'opener')"),
});
const PROMOTIONS = [
    {
        id: "spring_special",
        title: "Broken Spring Special",
        discount: "$75 OFF 2 Springs / $30 OFF 1",
        description: "Springs are your door's backbone—replace them now to keep it lifting smooth.",
        service_types: ["repair"],
        issue_types: ["broken_spring", "spring"],
        priority: 1,
        valid_until: "2026-12-31",
    },
    {
        id: "new_door",
        title: "New Door Savings",
        discount: "$200 OFF Any New Garage Door",
        description: "Steel, insulated, or custom. Boost curb appeal and recoup up to 194% at resale.",
        service_types: ["installation"],
        issue_types: [],
        priority: 2,
        valid_until: "2026-12-31",
    },
    {
        id: "tune_up",
        title: "Safety & Maintenance Deal",
        discount: "$49 (Reg. $89)",
        description: "Annual Lube & Tune with 24-Point Safety Inspection. Protect your investment!",
        service_types: ["maintenance"],
        issue_types: ["maintenance", "tune_up", "rollers", "lubrication"],
        priority: 3,
        valid_until: "2026-12-31",
    },
    {
        id: "opener_special",
        title: "Garage Motor Special",
        discount: "$100 OFF LiftMaster Elite Series",
        description: "Smart features like MyQ app, 2,000-lumen LED, and ultra-quiet motor.",
        service_types: ["repair", "installation"],
        issue_types: ["opener", "motor", "remote"],
        priority: 4,
        valid_until: "2026-12-31",
    },
    {
        id: "winterization",
        title: "Winterization Special",
        discount: "50% OFF Rollers, Bottom Seals & Weather Trim",
        description: "Prepare your garage for the colder months.",
        service_types: ["maintenance"],
        issue_types: ["weather_seal", "rollers", "seal"],
        priority: 5,
        valid_until: "2026-03-31",
    },
    {
        id: "new_door_bundle",
        title: "New Door Upgrade Bundle",
        discount: "FREE Rollers + Lube & Tune ($287 Value)",
        description: "Purchase a new garage door motor with installation and get free rollers plus professional tune-up.",
        service_types: ["installation"],
        issue_types: ["opener", "motor"],
        priority: 6,
        valid_until: "2026-12-31",
    },
];
function getActivePromotions(serviceType, issueType) {
    let filtered = PROMOTIONS;
    if (serviceType && serviceType !== "all") {
        filtered = filtered.filter((p) => p.service_types.includes(serviceType));
    }
    if (issueType) {
        const issueLower = issueType.toLowerCase();
        filtered = filtered.filter((p) => p.issue_types.some((t) => issueLower.includes(t)));
    }
    return filtered.sort((a, b) => a.priority - b.priority);
}
export const getPromotionsTool = {
    name: "get_promotions",
    metadata: {
        title: "Get Current Promotions",
        description: "Retrieve current A Plus Garage Door deals, coupons, and special offers. Use when user asks about pricing, discounts, or deals.",
        inputSchema: InputSchema.shape,
        _meta: {
            "openai/outputTemplate": `${process.env.WIDGET_BASE_URL}/promotions-carousel.html`,
            "openai/toolInvocation/invoking": "Finding current deals...",
            "openai/toolInvocation/invoked": "Found available promotions",
        },
    },
    handler: async (input) => {
        const validated = InputSchema.parse(input);
        const promos = getActivePromotions(validated.service_type, validated.issue_type);
        return {
            structuredContent: {
                promotions: promos,
                promotion_count: promos.length,
                phone_nevada: process.env.PHONE_NEVADA || "(702) 297-7811",
                phone_utah: process.env.PHONE_UTAH || "(801) 683-6222",
                disclaimer: "One coupon per visit. Not stackable with other offers. Terms apply.",
            },
        };
    },
};
//# sourceMappingURL=get-promotions.js.map