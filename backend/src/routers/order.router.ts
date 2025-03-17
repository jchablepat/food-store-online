import { Router } from "express";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import { OrderModel } from "../models/order.model";
import { OrderStatus } from "../constants/order_status";
import auth from "../middlewares/auth.middleware";

const router = Router();
router.use(auth);

router.post('/create', async (req:any, res) => {
    const requestOrder = req.body;

    if(requestOrder.items.length <= 0) {
        res.status(HTTP_BAD_REQUEST).send('Car is empty!');
        return;
    }

    await OrderModel.deleteOne({
        user: req.user.id,
        status: OrderStatus.NEW
    });

    const newOrder = new OrderModel({ ...requestOrder, user: req.user.id });
    await newOrder.save();
    res.send(newOrder);
});

router.get('/latest', async (req : any, res) => {
    const order = await GetNewOrder(req);

    if(order) res.send(order);
    else res.status(HTTP_BAD_REQUEST).send();
});

router.post('/pay', async (req : any, res) => {
    const { paymentId } = req.body;

    const order = await GetNewOrder(req);
    if(!order) {
        res.status(HTTP_BAD_REQUEST).send('No order found!');
        return;
    }

    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();

    res.send(order._id);
});

router.get('/track/:id', async (req : any, res) => {
    const order = await OrderModel.findById(req.params.id);
    if(order) res.send(order);
    else res.status(HTTP_BAD_REQUEST).send('No order found!');
});

async function GetNewOrder(req : any) {
    return await OrderModel.findOne({ user : req.user.id, status: OrderStatus.NEW });
}    

export default router;