import { Request, Response } from "express";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import { OrderStatus } from "../constants/order_status";
import { OrderModel } from "../models/order.model";

export async function createOrder(req: any, res: Response) {
  try {
    const requestOrder = req.body;

    if (requestOrder.items.length <= 0) {
      res.status(HTTP_BAD_REQUEST).send("Cart is empty!");
      return;
    }

    await OrderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW
    });

    const newOrder = new OrderModel({ ...requestOrder, user: req.user.id });
    await newOrder.save();
    res.status(200).send(newOrder);
  } catch (error) {
    res.status(500).send({ message: "Error creating order", error: (error as Error).message });
  }
}

export async function getLatestOrder(req: any, res: Response) {
  try {
    const order = await getNewOrder(req);

    if (order) res.send(order);
    else res.status(HTTP_BAD_REQUEST).send("No order found!");
  } catch (error) {
    res.status(500).send({ message: "Error fetching latest order", error: (error as Error).message });
  }
}

export async function payOrder(req: any, res: Response) {
  try {
    const { paymentId } = req.body;

    const order = await getNewOrder(req);
    if (!order) {
      res.status(HTTP_BAD_REQUEST).send("No order found!");
      return;
    }

    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();

    res.send(order._id);
  } catch (error) {
    res.status(500).send({ message: "Error processing payment", error: (error as Error).message });
  }
}

export async function trackOrder(req: Request, res: Response) {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (order) res.send(order);
    else res.status(HTTP_BAD_REQUEST).send("No order found!");
  } catch (error) {
    res.status(500).send({ message: "Error tracking order", error: (error as Error).message });
  }
}

async function getNewOrder(req: any) {
  return await OrderModel.findOne({ user: req.user.id, status: OrderStatus.NEW });
}
