import { z } from "zod";
declare const InputSchema: z.ZodObject<{
    symptoms: z.ZodArray<z.ZodString, "many">;
    door_age_years: z.ZodOptional<z.ZodNumber>;
    door_type: z.ZodOptional<z.ZodEnum<["single", "double", "unknown"]>>;
}, "strip", z.ZodTypeAny, {
    symptoms: string[];
    door_age_years?: number | undefined;
    door_type?: "single" | "double" | "unknown" | undefined;
}, {
    symptoms: string[];
    door_age_years?: number | undefined;
    door_type?: "single" | "double" | "unknown" | undefined;
}>;
type DiagnosisIssue = {
    name: string;
    description: string;
    cost_range: {
        min: number;
        max: number;
    };
    promotion?: string;
    safety_note?: string;
};
export declare const diagnoseIssueTool: {
    name: string;
    metadata: {
        title: string;
        description: string;
        inputSchema: {
            symptoms: z.ZodArray<z.ZodString, "many">;
            door_age_years: z.ZodOptional<z.ZodNumber>;
            door_type: z.ZodOptional<z.ZodEnum<["single", "double", "unknown"]>>;
        };
        _meta: {
            "openai/outputTemplate": string;
            "openai/toolInvocation/invoking": string;
            "openai/toolInvocation/invoked": string;
        };
    };
    handler: (input: z.infer<typeof InputSchema>) => Promise<{
        structuredContent: {
            likely_issues: DiagnosisIssue[];
            confidence: number;
            urgency: "emergency" | "soon" | "routine";
            recommended_service: "repair" | "maintenance" | "replacement";
            estimated_cost_range: {
                min: number;
                max: number;
            };
            applicable_promotion: any;
            safety_warning: string | null;
            next_steps: string[];
        };
    }>;
};
export {};
//# sourceMappingURL=diagnose-issue.d.ts.map