import { z } from "zod";
import serviceAreasData from "../../service-areas-data.json" assert { type: "json" };
const InputSchema = z.object({
    location: z
        .string()
        .describe("City name, neighborhood, or zip code (e.g., 'Henderson', 'Summerlin', '89123', 'Salt Lake City', 'Provo')"),
});
function findServiceArea(location) {
    const searchTerm = location.toLowerCase().trim();
    // Check Nevada areas
    const nevadaAreas = serviceAreasData.regions.nevada.areas;
    for (const area of nevadaAreas) {
        if (area.name.toLowerCase() === searchTerm) {
            return {
                isCovered: true,
                areaName: area.name,
                state: "Nevada",
                phone: serviceAreasData.coverage_notes.phone_nevada,
                nearestArea: null,
                distance: 0,
                coordinates: area.coords,
            };
        }
        // Check zip code prefixes
        for (const prefix of area.zip_prefixes) {
            if (searchTerm.startsWith(prefix)) {
                return {
                    isCovered: true,
                    areaName: area.name,
                    state: "Nevada",
                    phone: serviceAreasData.coverage_notes.phone_nevada,
                    nearestArea: null,
                    distance: 0,
                    coordinates: area.coords,
                };
            }
        }
    }
    // Check Utah areas
    const utahRegions = serviceAreasData.regions.utah.regions;
    for (const [regionKey, regionData] of Object.entries(utahRegions)) {
        const areas = regionData.areas;
        for (const area of areas) {
            if (area.name.toLowerCase() === searchTerm) {
                return {
                    isCovered: true,
                    areaName: area.name,
                    state: "Utah",
                    phone: serviceAreasData.coverage_notes.phone_utah,
                    nearestArea: null,
                    distance: 0,
                    coordinates: area.coords,
                };
            }
            // Check zip code prefixes
            for (const prefix of area.zip_prefixes) {
                if (searchTerm.startsWith(prefix)) {
                    return {
                        isCovered: true,
                        areaName: area.name,
                        state: "Utah",
                        phone: serviceAreasData.coverage_notes.phone_utah,
                        nearestArea: null,
                        distance: 0,
                        coordinates: area.coords,
                    };
                }
            }
        }
    }
    // Not covered - return nearest area
    return {
        isCovered: false,
        areaName: null,
        state: null,
        phone: serviceAreasData.coverage_notes.phone_nevada, // Default to Nevada
        nearestArea: "Las Vegas or Salt Lake City",
        distance: 0,
        coordinates: null,
    };
}
export const checkServiceAreaTool = {
    name: "check_service_area",
    metadata: {
        title: "Check Service Area",
        description: "Verify if a location is within A Plus Garage Door's service area across Nevada and Utah. Use when user mentions a city, neighborhood, or zip code.",
        inputSchema: InputSchema.shape,
        _meta: {
            "openai/outputTemplate": `${process.env.WIDGET_BASE_URL}/service-area-result.html`,
            "openai/toolInvocation/invoking": "Checking service area coverage...",
            "openai/toolInvocation/invoked": "Service area verified",
        },
    },
    handler: async (input) => {
        const validated = InputSchema.parse(input);
        const coverage = findServiceArea(validated.location);
        return {
            structuredContent: {
                location: validated.location,
                is_covered: coverage.isCovered,
                service_area_name: coverage.areaName,
                state: coverage.state,
                phone: coverage.phone,
                nearest_coverage: coverage.nearestArea,
                distance_miles: coverage.distance,
                emergency_available: true,
                map_center: coverage.coordinates,
            },
        };
    },
};
//# sourceMappingURL=check-service-area.js.map