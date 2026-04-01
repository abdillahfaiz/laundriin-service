import { Router } from "express";
import * as saldoController from "./saldo.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { pencairanSchema } from "./saldo.schema";

const router = Router();

router.use(verifyToken, requireRole(["admin_outlet"]));

router.get("/", saldoController.getSaldo);
router.get("/log", saldoController.getSaldoLog);
router.post("/pencairan", validateBody(pencairanSchema), saldoController.requestPencairan);
router.get("/pencairan", saldoController.getPencairanList);
router.get("/pencairan/:id", saldoController.getPencairanById);

export default router;
