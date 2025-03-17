import { Food } from "./Food";

export class CartItem {
    quantity: number = 1;
    price: number;

    constructor(public food: Food) {
        this.price = this.food.price;
    }
}