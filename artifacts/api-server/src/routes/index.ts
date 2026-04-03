import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import botsRouter from "./bots.js";
import plansRouter from "./plans.js";
import paymentsRouter from "./payments.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/bots", botsRouter);
router.use("/plans", plansRouter);
router.use("/payments", paymentsRouter);
router.use("/admin", adminRouter);

export default router;
