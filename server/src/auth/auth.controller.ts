import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "../guards/public.decorator";
import { AdminGuard } from "../guards/admin.guard";


@Controller('login')
export class AuthController {
    constructor(private readonly loginService: AuthService) {}

    @Public()
    @Post()
    async login(
        @Body('username') username: string,
        @Body('password') plainTextPassword: string
    ) {
        return this.loginService.login(username, plainTextPassword);
    }

    @Post('create')
    @UseGuards(AdminGuard)
    async create(
        @Body('username') username: string,
        @Body('password') plainTextPassword: string,
        @Body('roles') roles: string[],
    ) {
        return this.loginService.create(username, plainTextPassword, roles);
    }
}