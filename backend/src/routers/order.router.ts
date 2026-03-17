import { Router } from "express";
import auth from "../middlewares/auth.middleware";
import { createOrder, getLatestOrder, payOrder, trackOrder } from "../controllers/order.controller";

const router = Router();
router.use(auth);

router.post("/create", createOrder);

router.get("/latest", getLatestOrder);

router.post("/pay", payOrder);

router.get("/track/:id", trackOrder);

export default router;
