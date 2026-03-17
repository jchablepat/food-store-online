import { Router } from "express";
import { getFoodById, getFoods, getFoodTags, getFoodsByTag, searchFoods, seedFoods } from "../controllers/food.controller";
const router = Router();

router.get("/seed", seedFoods);

router.get("/", getFoods);

router.get("/search/:searchTerm", searchFoods);

/** 
 * Operación de agregación en MongoDB para contar y agrupar etiquetas de alimentos.
 * 
 */
router.get("/tags", getFoodTags);

router.get("/tags/:tagName", getFoodsByTag);

router.get("/:id", getFoodById);

export default router;
