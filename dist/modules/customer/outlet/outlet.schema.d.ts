import { z } from "zod/v4";
export declare const nearbyOutletQuerySchema: z.ZodObject<{
    lat: z.ZodCoercedNumber<unknown>;
    lng: z.ZodCoercedNumber<unknown>;
    radius: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=outlet.schema.d.ts.map