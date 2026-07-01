import { Logger } from "@nestjs/common";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import * as jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(EventsGateway.name);

    @WebSocketServer() server: Server;

    handleConnection(client: Socket) {
        const token = client.handshake.auth?.token as string | undefined;
        if (!token) {
            this.logger.warn(`Klijent ${client.id} bez tokena — konekcija odbijena`);
            client.disconnect(true);
            return;
        }
        try {
            jwt.verify(token, process.env.JWT_S);
        } catch (error) {
            this.logger.warn(`Klijent ${client.id} sa nevalidnim tokenom — konekcija odbijena`);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.debug(`Klijent ${client.id} diskonektovan`);
    }

    broadcast(entity: string, action: 'created' | 'updated' | 'deleted', meta?: Record<string, any>) {
        this.server?.emit('data-changed', { entity, action, ...meta, timestamp: Date.now() });
    }
}
