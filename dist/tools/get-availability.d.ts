import { z } from "zod";
declare const InputSchema: z.ZodObject<{
    service_type: z.ZodEnum<["emergency", "repair", "installation", "maintenance"]>;
    location: z.ZodString;
    date_range_days: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    location: string;
    service_type: "emergency" | "repair" | "maintenance" | "installation";
    date_range_days: number;
}, {
    location: string;
    service_type: "emergency" | "repair" | "maintenance" | "installation";
    date_range_days?: number | undefined;
}>;
type AvailabilitySlot = {
    date: string;
    time_window: string;
    technician: string;
    available: boolean;
};
export declare const getAvailabilityTool: {
    name: string;
    metadata: {
        title: string;
        description: string;
        inputSchema: {
            service_type: z.ZodEnum<["emergency", "repair", "installation", "maintenance"]>;
            location: z.ZodString;
            date_range_days: z.ZodDefault<z.ZodNumber>;
        };
        _meta: {
            "openai/outputTemplate": string;
            "openai/toolInvocation/invoking": string;
            "openai/toolInvocation/invoked": string;
        };
    };
    handler: (input: z.infer<typeof InputSchema>) => Promise<{
        structuredContent: {
            service_type: "emergency" | "repair" | "maintenance" | "installation";
            location: string;
            emergency_available_now: boolean;
            available_slots: AvailabilitySlot[];
            next_available: AvailabilitySlot;
            total_slots: number;
            phone: string;
            note: string;
        };
    }>;
};
export {};
//# sourceMappingURL=get-availability.d.ts.map