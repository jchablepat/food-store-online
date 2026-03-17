import { connect, ConnectOptions } from 'mongoose';

export const dbConnect = () => {
    connect(process.env.MONGODB_REMOTE_URL!, {

    } as ConnectOptions)
    .then(
        () => console.log("MongoDB Connected Successfully"),
        (error) => console.log("Could not connect to the database: " + error)
    )
};