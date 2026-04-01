import { z } from "zod/v4";
export declare const nearbyOutletQuerySchema: z.ZodObject<{
    lat: z.ZodCoercedNumber<unknown>;
    lng: z.ZodCoercedNumber<unknown>;
    radius: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const checkCoverageSchema: z.ZodObject<{
    lat: z.ZodCoercedNumber<unknown>;
    lng: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=outlet.schema.d.ts.map