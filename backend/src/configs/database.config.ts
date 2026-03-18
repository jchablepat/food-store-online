import { connect, ConnectOptions } from 'mongoose';

export const dbConnect = () => {
    const uri = process.env.MONGODB_REMOTE_URL;
    if (!uri) {
        throw new Error('MONGODB_REMOTE_URL is missing. Create backend/.env (or backend/src/.env) with MONGODB_REMOTE_URL=...');
    }

    connect(uri, {

    } as ConnectOptions)
    .then(
        () => console.log("MongoDB Connected Successfully"),
        (error) => console.log("Could not connect to the database: " + error)
    )
};
