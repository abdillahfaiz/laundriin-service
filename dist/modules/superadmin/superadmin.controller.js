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
exports.toggleUser = exports.getUsers = exports.processPencairan = exports.getPencairanById = exports.getPencairanList = exports.updateOutletStatus = exports.getOutletById = exports.getOutlets = exports.getDashboard = void 0;
const superadminService = __importStar(require("./superadmin.service"));
const response_util_1 = require("../../utils/response.util");
const getDashboard = async (req, res, next) => {
    try {
        const data = await superadminService.getDashboard();
        return res.status(200).json((0, response_util_1.success)("Dashboard superadmin", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getDashboard = getDashboard;
const getOutlets = async (req, res, next) => {
    try {
        const data = await superadminService.getOutlets();
        return res.status(200).json((0, response_util_1.success)("List outlet", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getOutlets = getOutlets;
const getOutletById = async (req, res, next) => {
    try {
        const data = await superadminService.getOutletById(req.params.id);
        return res.status(200).json((0, response_util_1.success)("Detail outlet", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getOutletById = getOutletById;
const updateOutletStatus = async (req, res, next) => {
    try {
        const data = await superadminService.updateOutletStatus(req.params.id, req.body.status);
        return res.status(200).json((0, response_util_1.success)("Status outlet berhasil diupdate", data));
    }
    catch (err) {
        next(err);
    }
};
exports.updateOutletStatus = updateOutletStatus;
const getPencairanList = async (req, res, next) => {
    try {
        const data = await superadminService.getPencairanList();
        return res.status(200).json((0, response_util_1.success)("List pencairan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getPencairanList = getPencairanList;
const getPencairanById = async (req, res, next) => {
    try {
        const data = await superadminService.getPencairanById(req.params.id);
        return res.status(200).json((0, response_util_1.success)("Detail pencairan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getPencairanById = getPencairanById;
const processPencairan = async (req, res, next) => {
    try {
        const data = await superadminService.processPencairan(req.params.id, req.body.status, req.body.bukti_transfer, req.body.catatan_admin, req.user.userId);
        return res.status(200).json((0, response_util_1.success)("Pencairan berhasil diproses", data));
    }
    catch (err) {
        next(err);
    }
};
exports.processPencairan = processPencairan;
const getUsers = async (req, res, next) => {
    try {
        const data = await superadminService.getUsers();
        return res.status(200).json((0, response_util_1.success)("List users", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getUsers = getUsers;
const toggleUser = async (req, res, next) => {
    try {
        const data = await superadminService.toggleUser(req.params.id);
        return res.status(200).json((0, response_util_1.success)("Status user berhasil diubah", data));
    }
    catch (err) {
        next(err);
    }
};
exports.toggleUser = toggleUser;
//# sourceMappingURL=superadmin.controller.js.map