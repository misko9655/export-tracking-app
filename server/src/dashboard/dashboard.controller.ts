import { Controller, Get, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { SuperAdminGuard } from "src/guards/super-admin.guard";

@Controller('dashboard')
@UseGuards(SuperAdminGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    getStats() {
        return this.dashboardService.getStats();
    }

    @Get('users')
    getUsers() {
        return this.dashboardService.getUsers();
    }
}
