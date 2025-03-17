// IMPORTANT! 
// Install npm leaflet: 'npm install' leaflet and 'npm install --save-dev @types/leaflet' for use in TypeScript
import { LatLng } from "leaflet";
import { CartItem } from "./CartItem"

export class Order {
    id!: number;
    items!: CartItem[];
    totalPrice!: number;
    name!: string;
    address!: string;
    addressLatLng?: LatLng;
    paymentId!: string;
    createdAt!: string;
    status!: string;
}