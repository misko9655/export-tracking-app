import { Injectable, Logger, NestMiddleware } from "node_modules/@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as jwt from "jsonwebtoken";
import { User, UserDocument } from "src/auth/users.schema";

@Injectable()
export class GetUserMiddleware implements NestMiddleware {
    private readonly logger = new Logger(GetUserMiddleware.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async use(req: Request, res: Response, next: (error?: any) => void) {
        const authHeader = (req.headers as any).authorization;
        if (!authHeader) {
            next();
            return;
        }
        const authJwtToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        try {
            const decoded = jwt.verify(authJwtToken, process.env.JWT_S) as { username: string };
            // Read the current roles/permissions from the DB on every request instead of
            // trusting the (up to 8h old) JWT payload, so permission changes made from the
            // Dashboard take effect immediately without requiring the user to re-login.
            const dbUser = await this.userModel.findOne({ username: decoded.username }).lean();
            if (dbUser) {
                req["user"] = {
                    username: dbUser.username,
                    roles: dbUser.roles,
                    pagePermissions: dbUser.pagePermissions ?? null,
                };
            }
        } catch (error) {
            this.logger.error("Error verifying JWT token:", error);
        }
        next();
    }
}