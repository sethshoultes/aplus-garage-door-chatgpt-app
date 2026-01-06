import { z } from "zod";

const InputSchema = z.object({
  style_filter: z
    .enum(["steel", "aluminum", "insulated", "glass", "custom", "all"])
    .optional()
    .describe("Filter by door material/style"),
  budget_range: z
    .enum(["economy", "mid-range", "premium", "all"])
    .optional()
    .describe("Filter by price range"),
});

const DOOR_STYLES = [
  {
    id: "steel_classic",
    name: "Classic Steel",
    type: "steel",
    budget: "economy",
    price_range: "$800 - $1,500",
    description:
      "Durable, low-maintenance steel doors in traditional raised panel design",
    features: ["Rust-resistant", "Multiple colors", "10-year warranty"],
    image_url: "/images/doors/steel-classic.jpg",
  },
  {
    id: "steel_carriage",
    name: "Carriage House Steel",
    type: "steel",
    budget: "mid-range",
    price_range: "$1,500 - $2,500",
    description:
      "Steel doors with carriage house styling for classic curb appeal",
    features: ["Decorative hardware", "Wood-look finish", "Insulation options"],
    image_url: "/images/doors/steel-carriage.jpg",
  },
  {
    id: "insulated_premium",
    name: "Premium Insulated",
    type: "insulated",
    budget: "mid-range",
    price_range: "$1,800 - $3,000",
    description: "Triple-layer insulated doors perfect for temperature control",
    features: ["R-16 insulation", "Energy efficient", "Quieter operation"],
    image_url: "/images/doors/insulated-premium.jpg",
  },
  {
    id: "aluminum_modern",
    name: "Modern Aluminum",
    type: "aluminum",
    budget: "premium",
    price_range: "$3,000 - $5,000",
    description:
      "Sleek, contemporary aluminum frames with glass panels",
    features: ["Full-view glass", "Powder-coated frames", "Modern aesthetic"],
    image_url: "/images/doors/aluminum-modern.jpg",
  },
  {
    id: "glass_full",
    name: "Full Glass",
    type: "glass",
    budget: "premium",
    price_range: "$4,000 - $7,000",
    description: "Maximum natural light with tempered glass panels",
    features: [
      "Tempered safety glass",
      "Frosted options",
      "Dramatic curb appeal",
    ],
    image_url: "/images/doors/glass-full.jpg",
  },
  {
    id: "custom_design",
    name: "Custom Design",
    type: "custom",
    budget: "premium",
    price_range: "$5,000+",
    description: "Fully customized doors designed to your specifications",
    features: [
      "Unique designs",
      "Any material combination",
      "Architectural matching",
    ],
    image_url: "/images/doors/custom.jpg",
  },
];

export const getDoorStylesTool = {
  name: "get_door_styles",
  metadata: {
    title: "Browse Garage Door Styles",
    description:
      "Show available garage door styles for installation. Use when user asks about new door options, styles, or replacements.",
    inputSchema: InputSchema.shape,
    _meta: {
      "openai/outputTemplate": `${process.env.WIDGET_BASE_URL}/door-styles-carousel.html`,
      "openai/toolInvocation/invoking": "Loading door styles...",
      "openai/toolInvocation/invoked": "Here are your options",
    },
  },
  handler: async (input: z.infer<typeof InputSchema>) => {
    const validated = InputSchema.parse(input);

    const filtered = DOOR_STYLES.filter(
      (s) =>
        (!validated.style_filter ||
          validated.style_filter === "all" ||
          s.type === validated.style_filter) &&
        (!validated.budget_range ||
          validated.budget_range === "all" ||
          s.budget === validated.budget_range)
    );

    return {
      structuredContent: {
        styles: filtered,
        total_styles: filtered.length,
        promotion: {
          code: "new_door",
          discount: "$200 OFF",
          description: "Any new garage door installation",
        },
        consultation_available: true,
        financing_available: true,
        phone_nevada: process.env.PHONE_NEVADA || "(702) 297-7811",
        phone_utah: process.env.PHONE_UTAH || "(801) 683-6222",
      },
    };
  },
};
