import { z } from "zod";

const InputSchema = z.object({
  service_type: z
    .enum(["emergency", "repair", "installation", "maintenance"])
    .describe("Type of service"),
  location: z.string().describe("Service location (city or zip code)"),
  date_range_days: z
    .number()
    .default(7)
    .describe("Number of days to check availability"),
});

type AvailabilitySlot = {
  date: string;
  time_window: string;
  technician: string;
  available: boolean;
};

async function getServiceTitanAvailability(
  serviceType: string,
  location: string,
  days: number
): Promise<AvailabilitySlot[]> {
  const USE_MOCK_API = process.env.USE_MOCK_API === "true";

  if (!USE_MOCK_API) {
    throw new Error("ServiceTitan integration not yet configured");
  }

  // Mock availability data
  const slots: AvailabilitySlot[] = [];
  const today = new Date();

  // Emergency service = immediate availability
  if (serviceType === "emergency") {
    slots.push({
      date: today.toISOString(),
      time_window: "Immediate (1-2 hours)",
      technician: "Emergency Team",
      available: true,
    });
    return slots;
  }

  // Generate slots for next N days
  const timeWindows = ["8:00 AM - 12:00 PM", "12:00 PM - 5:00 PM", "5:00 PM - 8:00 PM"];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip Sundays for non-emergency
    if (date.getDay() === 0) continue;

    // More availability in first 3 days
    const slotsPerDay = i < 3 ? 2 : 1;

    for (let j = 0; j < slotsPerDay; j++) {
      slots.push({
        date: date.toISOString(),
        time_window: timeWindows[j],
        technician: i === 0 ? "Available" : "Will assign",
        available: true,
      });
    }
  }

  return slots;
}

export const getAvailabilityTool = {
  name: "get_availability",
  metadata: {
    title: "Check Availability",
    description:
      "Check available appointment slots for A Plus Garage Door service. Use when user asks about scheduling or availability.",
    inputSchema: InputSchema.shape,
    _meta: {
      "openai/outputTemplate": `${process.env.WIDGET_BASE_URL}/availability-slots.html`,
      "openai/toolInvocation/invoking": "Checking technician availability...",
      "openai/toolInvocation/invoked": "Found available slots",
    },
  },
  handler: async (input: z.infer<typeof InputSchema>) => {
    const validated = InputSchema.parse(input);

    const slots = await getServiceTitanAvailability(
      validated.service_type,
      validated.location,
      validated.date_range_days
    );

    // Determine phone based on location
    const phone = validated.location.toLowerCase().match(/utah|salt lake|provo|ogden|st\.? george/i)
      ? process.env.PHONE_UTAH || "(801) 683-6222"
      : process.env.PHONE_NEVADA || "(702) 297-7811";

    return {
      structuredContent: {
        service_type: validated.service_type,
        location: validated.location,
        emergency_available_now: validated.service_type === "emergency",
        available_slots: slots,
        next_available: slots[0],
        total_slots: slots.length,
        phone,
        note:
          validated.service_type === "emergency"
            ? "24/7 emergency service available - call now for immediate dispatch"
            : "Book online or call to schedule your preferred time",
      },
    };
  },
};
