import { Injectable, Logger, NestMiddleware } from "node_modules/@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class GetUserMiddleware implements NestMiddleware {
    private readonly logger = new Logger(GetUserMiddleware.name);

    use(req: Request, res: Response, next: (error?: any) => void) {
        const authHeader = (req.headers as any).authorization;
        if (!authHeader) {
            next();
            return;
        }
        const authJwtToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        try {
            const user = jwt.verify(authJwtToken, process.env.JWT_S);
            if (user) {
                req["user"] = user;
            }
        } catch (error) {
            this.logger.error("Error verifying JWT token:", error);
        }
        next();
    }
}