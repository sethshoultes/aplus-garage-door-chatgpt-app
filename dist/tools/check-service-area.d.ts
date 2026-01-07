import { z } from "zod";
declare const InputSchema: z.ZodObject<{
    location: z.ZodString;
}, "strip", z.ZodTypeAny, {
    location: string;
}, {
    location: string;
}>;
export declare const checkServiceAreaTool: {
    name: string;
    metadata: {
        title: string;
        description: string;
        inputSchema: {
            location: z.ZodString;
        };
        _meta: {
            "openai/outputTemplate": string;
            "openai/toolInvocation/invoking": string;
            "openai/toolInvocation/invoked": string;
        };
    };
    handler: (input: z.infer<typeof InputSchema>) => Promise<{
        structuredContent: {
            location: string;
            is_covered: boolean;
            service_area_name: string | null;
            state: string | null;
            phone: string | null;
            nearest_coverage: string | null;
            distance_miles: number;
            emergency_available: boolean;
            map_center: {
                lat: number;
                lng: number;
            } | null;
        };
    }>;
};
export {};
//# sourceMappingURL=check-service-area.d.ts.map