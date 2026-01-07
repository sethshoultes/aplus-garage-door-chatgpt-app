import { z } from "zod";
declare const InputSchema: z.ZodObject<{
    service_type: z.ZodEnum<["emergency_repair", "standard_repair", "installation", "maintenance"]>;
    issue_summary: z.ZodString;
    customer_name: z.ZodString;
    phone: z.ZodString;
    address: z.ZodString;
    preferred_date: z.ZodOptional<z.ZodString>;
    preferred_time_window: z.ZodOptional<z.ZodEnum<["morning", "afternoon", "evening", "asap"]>>;
    promotion_code: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    service_type: "maintenance" | "installation" | "emergency_repair" | "standard_repair";
    issue_summary: string;
    customer_name: string;
    phone: string;
    address: string;
    preferred_date?: string | undefined;
    preferred_time_window?: "morning" | "afternoon" | "evening" | "asap" | undefined;
    promotion_code?: string | undefined;
}, {
    service_type: "maintenance" | "installation" | "emergency_repair" | "standard_repair";
    issue_summary: string;
    customer_name: string;
    phone: string;
    address: string;
    preferred_date?: string | undefined;
    preferred_time_window?: "morning" | "afternoon" | "evening" | "asap" | undefined;
    promotion_code?: string | undefined;
}>;
export declare const createServiceRequestTool: {
    name: string;
    metadata: {
        title: string;
        description: string;
        inputSchema: {
            service_type: z.ZodEnum<["emergency_repair", "standard_repair", "installation", "maintenance"]>;
            issue_summary: z.ZodString;
            customer_name: z.ZodString;
            phone: z.ZodString;
            address: z.ZodString;
            preferred_date: z.ZodOptional<z.ZodString>;
            preferred_time_window: z.ZodOptional<z.ZodEnum<["morning", "afternoon", "evening", "asap"]>>;
            promotion_code: z.ZodOptional<z.ZodString>;
        };
        _meta: {
            "openai/outputTemplate": string;
            "openai/toolInvocation/invoking": string;
            "openai/toolInvocation/invoked": string;
            "openai/destructiveHint": boolean;
            "openai/confirmationRequired": boolean;
        };
    };
    handler: (input: z.infer<typeof InputSchema>) => Promise<{
        structuredContent: {
            confirmation_number: string;
            status: string;
            service_type: "maintenance" | "installation" | "emergency_repair" | "standard_repair";
            issue_summary: string;
            customer_name: string;
            scheduled_date: string;
            time_window: string;
            estimated_arrival: string;
            technician: string;
            address: string;
            phone: string;
            contact_phone: string;
            promotion_applied: any;
            can_modify: boolean;
            cancellation_policy: string;
            next_steps: string[];
        };
    }>;
};
export {};
//# sourceMappingURL=create-service-request.d.ts.map