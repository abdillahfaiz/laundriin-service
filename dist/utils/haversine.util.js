"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haversine = void 0;
/**
 * Haversine formula to calculate distance between two coordinates
 * @returns distance in kilometers (2 decimal places)
 */
const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(2));
};
exports.haversine = haversine;
const toRad = (value) => {
    return (value * Math.PI) / 180;
};
//# sourceMappingURL=haversine.util.js.map