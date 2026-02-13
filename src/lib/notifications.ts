import { prisma } from "./prisma";

export type NotificationType = 'INFO' | 'PROJECT_ASSIGNMENT' | 'COMMENT' | 'ALERT' | 'LEAD_CREATED' | 'PROJECT_CREATED' | 'PROPOSAL_CREATED' | 'ATTENDANCE';

interface NotificationData {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}

/**
 * Creates a single notification for a specific user
 */
export async function createNotification(data: NotificationData) {
    return await prisma.notification.create({
        data: {
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            link: data.link,
            isRead: false
        }
    });
}

/**
 * Sends a notification to all users with the ADMIN role
 */
export async function notifyAdmins(data: Omit<NotificationData, 'userId'>) {
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
    });

    if (admins.length === 0) return [];

    return await prisma.notification.createMany({
        data: admins.map(admin => ({
            userId: admin.id,
            title: data.title,
            message: data.message,
            type: data.type,
            link: data.link,
            isRead: false
        }))
    });
}

/**
 * Sends notifications to multiple users at once
 */
export async function notifyUsers(userIds: string[], data: Omit<NotificationData, 'userId'>) {
    if (userIds.length === 0) return [];

    return await prisma.notification.createMany({
        data: userIds.map(userId => ({
            userId,
            title: data.title,
            message: data.message,
            type: data.type,
            link: data.link,
            isRead: false
        }))
    });
}
