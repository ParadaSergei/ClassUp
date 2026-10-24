import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/notifications - get notifications for current user
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: currentUser.id },
      include: {
        script: {
          select: {
            id: true,
            title: true,
            situation: true,
            categoryEnum: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

// POST /api/notifications - admin share script with users
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { scriptId, userIds, message } = await req.json();

    if (!scriptId || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Заполните корректные параметры для отправки' }, { status: 400 });
    }

    const script = await prisma.script.findUnique({ where: { id: scriptId } });
    if (!script) {
      return NextResponse.json({ error: 'Скрипт не найден' }, { status: 404 });
    }

    const notificationMessage = message || `Администратор поделился с вами скриптом: "${script.title}"`;

    // Try createMany, fallback to creating row by row
    try {
      await prisma.notification.createMany({
        data: userIds.map((userId: string) => ({
          userId,
          scriptId,
          message: notificationMessage,
        })),
      });
    } catch (e: any) {
      for (const userId of userIds) {
        await prisma.notification.create({
          data: {
            userId,
            scriptId,
            message: notificationMessage,
          },
        });
      }
    }

    return NextResponse.json({ success: true, count: userIds.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Ошибка отправки уведомления' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - mark notifications as read
export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: currentUser.id,
        },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: currentUser.id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Ошибка обновления статуса' }, { status: 500 });
  }
}
