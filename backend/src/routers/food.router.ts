import { Router } from "express";
import { sample_foods, sample_tags } from "../data";
import { FoodModel } from "../models/food.model";
const router = Router();

router.get("/seed", async (req, res) => {
    const foodsCount = await FoodModel.countDocuments();
    if(foodsCount > 0) {
        res.send("Seed is already done!");
        return;
    }

    await FoodModel.create(sample_foods);
    res.send("Seed is done!");
});

router.get("/", async (req, res) => {
    const foods = await FoodModel.find();
    res.send(foods);
});

router.get("/search/:searchTerm", async (req, res) => {
    const searchTerm = req.params.searchTerm;
    const searchRegex = new RegExp(searchTerm, 'i'); // Insensitive search

    const foods = await FoodModel.find({ name: { $regex: searchRegex } });

    res.send(foods);
});

/** 
 * Operación de agregación en MongoDB para contar y agrupar etiquetas de alimentos.
 * 
 */
router.get("/tags", async (req, res) => {
    // La función 'aggregate' permite realizar operaciones de agregación complejas sobre los documentos de una colección.
    // Los datos fluyen a través de varias etapas de transformación
    const tags = await FoodModel.aggregate([
        // El operador $unwind "descompone" un array dentro de un documento, creando un nuevo documento para cada elemento del array.
        { $unwind: '$tags' },
        // El operador $group agrupa documentos según un campo especificado
        { 
            $group: {
                _id: '$tags',
                count: { $sum: 1 } // Para cada grupo, calcula un valor usando operadores de acumulación.
            }
        },
        // El operador $project da formato a los documentos de salida, permitiéndote incluir, excluir o renombrar campos
        { 
            $project: {
                _id: 0, // Excluyendo el campo
                name: '$_id', // Renombrando el campo _id (que contiene el nombre de la etiqueta) a 'name'
                count: '$count' // Manteniendo el campo 'count' como está
            }
        }
    ]).sort({ count: -1 }); // (el -1 indica orden descendente)

    const all =  {
        name: 'All',
        count: await FoodModel.countDocuments()
    }

    tags.unshift(all);
    res.send(tags);
});

router.get("/tags/:tagName", async (req, res) => {
    const tagName = req.params.tagName;
    const foods = await FoodModel.find({ tags : tagName});

    res.send(foods);
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const food = await FoodModel.findById(id);
    res.send(food);
});

export default router;
