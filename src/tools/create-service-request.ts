import { z } from "zod";

const InputSchema = z.object({
  service_type: z
    .enum(["emergency_repair", "standard_repair", "installation", "maintenance"])
    .describe("Type of service requested"),
  issue_summary: z
    .string()
    .describe("Brief description of the issue or service needed"),
  customer_name: z.string().describe("Customer's full name"),
  phone: z.string().describe("Customer's phone number"),
  address: z.string().describe("Service address including city and zip"),
  preferred_date: z
    .string()
    .optional()
    .describe("Preferred appointment date (ISO format) - ignored for emergency"),
  preferred_time_window: z
    .enum(["morning", "afternoon", "evening", "asap"])
    .optional()
    .describe("Preferred time window"),
  promotion_code: z.string().optional().describe("Promotion code to apply"),
});

// Mock ServiceTitan API
async function createServiceTitanBooking(args: z.infer<typeof InputSchema>) {
  const USE_MOCK_API = process.env.USE_MOCK_API === "true";

  if (USE_MOCK_API) {
    // Generate mock confirmation
    const confirmationId = `APL-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

    // Determine scheduled time
    let scheduledDate: string;
    let timeWindow: string;

    if (args.service_type === "emergency_repair") {
      // Emergency = today, ASAP
      scheduledDate = new Date().toISOString();
      timeWindow = "Next available (1-2 hours)";
    } else if (args.preferred_date) {
      scheduledDate = args.preferred_date;
      const windows = {
        morning: "8:00 AM - 12:00 PM",
        afternoon: "12:00 PM - 5:00 PM",
        evening: "5:00 PM - 8:00 PM",
        asap: "Next available",
      };
      timeWindow = windows[args.preferred_time_window || "morning"];
    } else {
      // Default to tomorrow morning
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      scheduledDate = tomorrow.toISOString();
      timeWindow = "8:00 AM - 12:00 PM";
    }

    return {
      confirmationId,
      status: "confirmed",
      scheduledDate,
      timeWindow,
      estimatedArrival:
        args.service_type === "emergency_repair"
          ? "Within 1-2 hours"
          : "Technician will call 30 minutes before arrival",
      assignedTech:
        args.service_type === "emergency_repair"
          ? "Emergency Team"
          : "Will be assigned day before",
    };
  } else {
    // Real ServiceTitan integration would go here
    throw new Error("ServiceTitan integration not yet configured");
  }
}

// Get promotion details
function getPromotionDetails(promoCode: string) {
  const promos: Record<string, any> = {
    spring_special: {
      code: "spring_special",
      title: "Broken Spring Special",
      discount: "$75 OFF 2 Springs / $30 OFF 1",
    },
    new_door: {
      code: "new_door",
      title: "New Door Savings",
      discount: "$200 OFF",
    },
    tune_up: {
      code: "tune_up",
      title: "Safety & Maintenance Deal",
      discount: "$49 (Reg. $89)",
    },
    opener_special: {
      code: "opener_special",
      title: "Garage Motor Special",
      discount: "$100 OFF LiftMaster",
    },
    winterization: {
      code: "winterization",
      title: "Winterization Special",
      discount: "50% OFF Rollers & Seals",
    },
  };

  return promos[promoCode] || null;
}

export const createServiceRequestTool = {
  name: "create_service_request",
  metadata: {
    title: "Book Service Appointment",
    description:
      "Create a service request and schedule an appointment with A Plus Garage Door. Use when user wants to book repair, installation, or maintenance service.",
    inputSchema: InputSchema.shape,
    _meta: {
      "openai/outputTemplate": `${process.env.WIDGET_BASE_URL}/appointment-confirmation.html`,
      "openai/toolInvocation/invoking": "Scheduling your appointment...",
      "openai/toolInvocation/invoked": "Appointment confirmed!",
      "openai/destructiveHint": false,
      "openai/confirmationRequired": true,
    },
  },
  handler: async (input: z.infer<typeof InputSchema>) => {
    const validated = InputSchema.parse(input);

    // Create booking
    const booking = await createServiceTitanBooking(validated);

    // Determine phone based on address
    const phone = validated.address.toLowerCase().includes("utah")
      ? process.env.PHONE_UTAH || "(801) 683-6222"
      : process.env.PHONE_NEVADA || "(702) 297-7811";

    return {
      structuredContent: {
        confirmation_number: booking.confirmationId,
        status: booking.status,
        service_type: validated.service_type,
        issue_summary: validated.issue_summary,
        customer_name: validated.customer_name,
        scheduled_date: booking.scheduledDate,
        time_window: booking.timeWindow,
        estimated_arrival: booking.estimatedArrival,
        technician: booking.assignedTech,
        address: validated.address,
        phone: validated.phone,
        contact_phone: phone,
        promotion_applied: validated.promotion_code
          ? getPromotionDetails(validated.promotion_code)
          : null,
        can_modify: true,
        cancellation_policy:
          "Free cancellation up to 2 hours before appointment",
        next_steps: [
          "You'll receive a text confirmation shortly",
          "Technician will call 30 minutes before arrival",
          "Have photos of your door ready if possible",
        ],
      },
    };
  },
};
