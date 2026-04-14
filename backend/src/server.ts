import express from 'express';
import cors from 'cors';
import foodRouter from './routers/food.router';
import userRouter from './routers/user.router';
import orderRouter from './routers/order.router';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();
import { dbConnect } from './configs/database.config';
dbConnect();

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: [process.env.CLIENT_URL!]
}));

// middlewares
if (process.env.NODE_ENV !== 'production') {
app.use(morgan('dev'));
}

app.use("/api/foods", foodRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);

app.use((req, res) => {
    res.status(404).json({
        message: 'Operación desconocida o ruta no encontrada'
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("Website served on port: " + port);
});

