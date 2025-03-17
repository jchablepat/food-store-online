import { Router } from "express";
import { sample_users } from "../data";
import jwt from "jsonwebtoken";
import { User, UserModel } from "../models/user.model";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import bcrypt from 'bcryptjs';

const router = Router();

router.get("/seed", async (req, res) => {
    const foodsCount = await UserModel.countDocuments();
    if(foodsCount > 0) {
        res.send("Seed is already done!");
        return;
    }

    await UserModel.create(sample_users);
    res.send("Seed is done!");
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if(user && (await bcrypt.compare(password, user.password))) {
        res.send(generateTokenReponse(user));
    } else {
        res.status(HTTP_BAD_REQUEST).send("Username/password is not valid");
    }
});

router.post("/register", async (req, res) => {
    const { name, email, password, address } = req.body;
    const user = await UserModel.findOne({ email });

    if(user) {
        res.status(HTTP_BAD_REQUEST).send('User is already exists, please login!');
        return;
    }

    const encryptedPwd = await bcrypt.hash(password, 10);
    const newUser: User = {
        id: '',
        name,
        email: email.toLowerCase(),
        password: encryptedPwd,
        address,
        isAdmin: false
    }

    const createdUser = await UserModel.create(newUser);
    res.send(generateTokenReponse(createdUser));
});

const generateTokenReponse = (user : User) => {
    const token = jwt.sign({
      id: user.id, email: user.email, isAdmin: user.isAdmin
    }, process.env.JWT_SECRET!,{
        expiresIn:"30d"
    });
  
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      address: user.address,
      isAdmin: user.isAdmin,
      token: token
    };
}

export default router;