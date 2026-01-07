import { z } from "zod";
declare const InputSchema: z.ZodObject<{
    service_type: z.ZodOptional<z.ZodEnum<["repair", "installation", "maintenance", "all"]>>;
    issue_type: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    service_type?: "repair" | "maintenance" | "installation" | "all" | undefined;
    issue_type?: string | undefined;
}, {
    service_type?: "repair" | "maintenance" | "installation" | "all" | undefined;
    issue_type?: string | undefined;
}>;
export declare const getPromotionsTool: {
    name: string;
    metadata: {
        title: string;
        description: string;
        inputSchema: {
            service_type: z.ZodOptional<z.ZodEnum<["repair", "installation", "maintenance", "all"]>>;
            issue_type: z.ZodOptional<z.ZodString>;
        };
        _meta: {
            "openai/outputTemplate": string;
            "openai/toolInvocation/invoking": string;
            "openai/toolInvocation/invoked": string;
        };
    };
    handler: (input: z.infer<typeof InputSchema>) => Promise<{
        structuredContent: {
            promotions: {
                id: string;
                title: string;
                discount: string;
                description: string;
                service_types: string[];
                issue_types: string[];
                priority: number;
                valid_until: string;
            }[];
            promotion_count: number;
            phone_nevada: string;
            phone_utah: string;
            disclaimer: string;
        };
    }>;
};
export {};
//# sourceMappingURL=get-promotions.d.ts.map