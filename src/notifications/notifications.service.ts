import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notification: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ) {
    const notification = this.notification.create({ userId, type, title, message, data });
    return await this.notification.save(notification);
  }

  async findAllForUser(userId: string, limit = 50) {
    return await this.notification.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async unreadCount(userId: string) {
    return await this.notification.count({ where: { userId, read: false } });
  }

  async markAsRead(id: string, userId: string) {
    await this.notification.update({ id, userId }, { read: true, readAt: new Date() });
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notification.update({ userId, read: false }, { read: true, readAt: new Date() });
    return { message: 'All notifications marked as read' };
  }
}
