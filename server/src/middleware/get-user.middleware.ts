import { Injectable, Logger, NestMiddleware } from "node_modules/@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class GetUserMiddleware implements NestMiddleware {
    private readonly logger = new Logger(GetUserMiddleware.name);

    use(req: Request, res: Response, next: (error?: any) => void) {
        const authJwtToken = (req.headers as any).authorization;
        if (!authJwtToken) {
            next();
            return;
        }

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