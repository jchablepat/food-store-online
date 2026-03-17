import { Request, Response } from "express";
import { sample_foods } from "../data";
import { FoodModel } from "../models/food.model";

export async function seedFoods(req: Request, res: Response) {
  try {
    const foodsCount = await FoodModel.countDocuments();
    if (foodsCount > 0) {
      res.status(200).send("Seed is already done!");
      return;
    }

    await FoodModel.create(sample_foods);
    res.status(200).send("Seed is done!");
  } catch (error) {
    res.status(500).send({ message: "Error seeding foods", error: (error as Error).message });
  }
}

export async function getFoods(req: Request, res: Response) {
  try {
    const foods = await FoodModel.find();
    res.status(200).send(foods);
  } catch (error) {
    res.status(500).send({ message: "Error fetching foods", error: (error as Error).message });
  }
}

export async function searchFoods(req: Request, res: Response) {
  try {
    const searchTerm = req.params.searchTerm;
    const searchRegex = new RegExp(searchTerm, "i");
    const foods = await FoodModel.find({ name: { $regex: searchRegex } });
    res.status(200).send(foods);
  } catch (error) {
    res.status(500).send({ message: "Error fetching foods", error: (error as Error).message });
  }
}

export async function getFoodTags(req: Request, res: Response) {
  try {
    const tags = await FoodModel.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: "$count"
        }
      }
    ]).sort({ count: -1 });

    const all = {
      name: "All",
      count: await FoodModel.countDocuments()
    };

    tags.unshift(all);
    res.status(200).send(tags);
  } catch (error) {
    res.status(500).send({ message: "Error fetching tags", error: (error as Error).message });
  }
}

export async function getFoodsByTag(req: Request, res: Response) {
  try {
    const tagName = req.params.tagName;
    const foods = await FoodModel.find({ tags: tagName });
    res.status(200).send(foods);
  } catch (error) {
    res.status(500).send({ message: "Error fetching foods", error: (error as Error).message });
  }
}

export async function getFoodById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const food = await FoodModel.findById(id);
    res.status(200).send(food);
  } catch (error) {
    res.status(500).send({ message: "Error fetching food", error: (error as Error).message });
  }
}
