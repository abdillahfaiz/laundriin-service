"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCoverageSchema = exports.nearbyOutletQuerySchema = void 0;
const v4_1 = require("zod/v4");
exports.nearbyOutletQuerySchema = v4_1.z.object({
    lat: v4_1.z.coerce.number().min(-90).max(90),
    lng: v4_1.z.coerce.number().min(-180).max(180),
    radius: v4_1.z.coerce.number().min(1).max(100).default(10),
    page: v4_1.z.coerce.number().int().min(1).optional(),
    limit: v4_1.z.coerce.number().int().min(1).max(100).optional(),
});
exports.checkCoverageSchema = v4_1.z.object({
    lat: v4_1.z.coerce.number().min(-90).max(90),
    lng: v4_1.z.coerce.number().min(-180).max(180),
});
//# sourceMappingURL=outlet.schema.js.map