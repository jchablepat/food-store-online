import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sample_users } from "../data";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import { User, UserModel } from "../models/user.model";

export async function seedUsers(req: Request, res: Response) {
  try {
    const foodsCount = await UserModel.countDocuments();
    if (foodsCount > 0) {
      res.send("Seed is already done!");
      return;
    }

    await UserModel.create(sample_users);
    res.send("Seed is done!");
  } catch (error) {
    res.status(500).send({ message: "Error seeding users", error: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.send(generateTokenReponse(user));
    } else {
      res.status(HTTP_BAD_REQUEST).send("Username/password is not valid");
    }
  } catch (error) {
    res.status(500).send({ message: "Error logging in", error: (error as Error).message });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, address } = req.body;
    const user = await UserModel.findOne({ email });

    if (user) {
      res.status(HTTP_BAD_REQUEST).send("User is already exists, please login!");
      return;
    }

    const encryptedPwd = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: "",
      name,
      email: email.toLowerCase(),
      password: encryptedPwd,
      address,
      isAdmin: false
    };

    const createdUser = await UserModel.create(newUser);
    res.send(generateTokenReponse(createdUser));
  } catch (error) {
    res.status(500).send({ message: "Error registering user", error: (error as Error).message });
  }
}

function generateTokenReponse(user: User) {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "30d"
    }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token: token
  };
}
