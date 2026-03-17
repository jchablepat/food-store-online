import { Router } from "express";
import { login, register, seedUsers } from "../controllers/user.controller";

const router = Router();

router.get("/seed", seedUsers);

router.post("/login", login);

router.post("/register", register);

export default router;
