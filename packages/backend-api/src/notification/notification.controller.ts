import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { ManualNotificationDto } from "./dto/manual-notification.dto";
import { NotificationService } from "./notification.service";

@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.listForVendor(user.vendorId ?? "");
  }

  @UseGuards(RolesGuard)
  @Roles("supervisor")
  @Post("manual")
  @HttpCode(HttpStatus.ACCEPTED)
  async sendManual(@Body() dto: ManualNotificationDto): Promise<void> {
    await this.notificationService.sendManual(dto.message, dto.recipients);
  }
}
