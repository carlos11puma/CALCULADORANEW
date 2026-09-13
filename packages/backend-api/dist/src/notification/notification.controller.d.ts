import { AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { ManualNotificationDto } from "./dto/manual-notification.dto";
import { NotificationService } from "./notification.service";
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    list(user: AuthenticatedUser): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        vendorId: string;
        thresholdCrossed: import("@prisma/client/runtime/library").Decimal | null;
        earningOpportunity: import("@prisma/client/runtime/library").JsonValue | null;
        sentAt: Date;
        read: boolean;
        periodMonth: string;
    }[]>;
    sendManual(dto: ManualNotificationDto): Promise<void>;
}
