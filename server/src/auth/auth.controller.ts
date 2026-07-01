import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "../guards/public.decorator";


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
    async create(
        @Body('username') username: string, 
        @Body('password') plainTextPassword: string
    ) {
        // return this.loginService.create(username, plainTextPassword);
    }
}