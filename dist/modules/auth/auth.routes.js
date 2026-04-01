"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("./auth.controller"));
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const auth_schema_1 = require("./auth.schema");
const router = (0, express_1.Router)();
// Public routes
router.post("/register/customer", (0, validate_middleware_1.validateBody)(auth_schema_1.registerCustomerSchema), authController.registerCustomer);
router.post("/register/outlet", (0, validate_middleware_1.validateBody)(auth_schema_1.registerOutletSchema), authController.registerOutlet);
router.post("/login", (0, validate_middleware_1.validateBody)(auth_schema_1.loginSchema), authController.login);
router.post("/refresh-token", (0, validate_middleware_1.validateBody)(auth_schema_1.refreshTokenSchema), authController.refreshToken);
// Authenticated routes
router.post("/logout", auth_middleware_1.verifyToken, authController.logout);
router.put("/fcm-token", auth_middleware_1.verifyToken, (0, validate_middleware_1.validateBody)(auth_schema_1.fcmTokenSchema), authController.updateFcmToken);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map