import { verify } from "jsonwebtoken";
import { HTTP_UNAUTHORIZED } from "../constants/http_status";

export default (req:any, res:any, next:any) => {
    // const token = req.headers.access_token as string;
    // if(!token) return res.status(HTTP_UNAUTHORIZED).json({message: 'Access denied!'});
    const authHeader = req.headers.authorization as string | undefined;

    // Use the standard Authorization header to avoid issues with custom headers in proxies.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(HTTP_UNAUTHORIZED).json({ message: 'Access denied!' });
    }

    const token = authHeader.substring(7);

    try {
        const decodeUser = verify(token, process.env.JWT_SECRET!);
        req.user = decodeUser;
        return next();
    } catch (error) {
        return res.status(HTTP_UNAUTHORIZED).json({ message: 'Token is invalid!', error: (error as Error).message });
    }
}
