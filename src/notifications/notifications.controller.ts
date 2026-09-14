import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { currentUser } from '../common/decorators';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@currentUser('sub') userId: string) {
    return this.notificationsService.findAllForUser(userId);
  }

  @Get('unread-count')
  unreadCount(@currentUser('sub') userId: string) {
    return this.notificationsService.unreadCount(userId);
  }

  @Patch('read-all')
  markAllAsRead(@currentUser('sub') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  markAsRead(@currentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, userId);
  }
}
