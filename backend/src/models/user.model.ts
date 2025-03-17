import { model, Schema } from "mongoose";

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    address: string;
    isAdmin: boolean;
}

export const UserSchema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true // Create automatically 'createdAt' and 'updatedAt' attributes in collection
});

export const UserModel = model<User>("user", UserSchema);