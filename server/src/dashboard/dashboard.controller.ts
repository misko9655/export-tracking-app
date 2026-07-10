import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { SuperAdminGuard } from "src/guards/super-admin.guard";
import { PagePermission } from "src/auth/users.schema";

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

    @Patch('users/:username/permissions')
    updateUserPermissions(
        @Param('username') username: string,
        @Body('pagePermissions') pagePermissions: Record<string, PagePermission> | null,
    ) {
        return this.dashboardService.updateUserPermissions(username, pagePermissions);
    }
}
