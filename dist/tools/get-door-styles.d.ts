import { z } from "zod";
declare const InputSchema: z.ZodObject<{
    style_filter: z.ZodOptional<z.ZodEnum<["steel", "aluminum", "insulated", "glass", "custom", "all"]>>;
    budget_range: z.ZodOptional<z.ZodEnum<["economy", "mid-range", "premium", "all"]>>;
}, "strip", z.ZodTypeAny, {
    style_filter?: "all" | "steel" | "aluminum" | "insulated" | "glass" | "custom" | undefined;
    budget_range?: "all" | "economy" | "mid-range" | "premium" | undefined;
}, {
    style_filter?: "all" | "steel" | "aluminum" | "insulated" | "glass" | "custom" | undefined;
    budget_range?: "all" | "economy" | "mid-range" | "premium" | undefined;
}>;
export declare const getDoorStylesTool: {
    name: string;
    metadata: {
        title: string;
        description: string;
        inputSchema: {
            style_filter: z.ZodOptional<z.ZodEnum<["steel", "aluminum", "insulated", "glass", "custom", "all"]>>;
            budget_range: z.ZodOptional<z.ZodEnum<["economy", "mid-range", "premium", "all"]>>;
        };
        _meta: {
            "openai/outputTemplate": string;
            "openai/toolInvocation/invoking": string;
            "openai/toolInvocation/invoked": string;
        };
    };
    handler: (input: z.infer<typeof InputSchema>) => Promise<{
        structuredContent: {
            styles: {
                id: string;
                name: string;
                type: string;
                budget: string;
                price_range: string;
                description: string;
                features: string[];
                image_url: string;
            }[];
            total_styles: number;
            promotion: {
                code: string;
                discount: string;
                description: string;
            };
            consultation_available: boolean;
            financing_available: boolean;
            phone_nevada: string;
            phone_utah: string;
        };
    }>;
};
export {};
//# sourceMappingURL=get-door-styles.d.ts.map