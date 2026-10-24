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

    if (!('notification' in prisma)) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await (prisma as any).notification.findMany({
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

    const unreadCount = await (prisma as any).notification.count({
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

    if (!('notification' in prisma)) {
      return NextResponse.json(
        { error: 'Таблица notifications еще не создана в PostgreSQL. Выполните SQL запрос.' },
        { status: 500 }
      );
    }

    // Try createMany, fallback to loop create if database driver doesn't support createMany
    try {
      if ((prisma as any).notification.createMany) {
        await (prisma as any).notification.createMany({
          data: userIds.map((userId: string) => ({
            userId,
            scriptId,
            message: notificationMessage,
          })),
        });
      } else {
        for (const userId of userIds) {
          await (prisma as any).notification.create({
            data: {
              userId,
              scriptId,
              message: notificationMessage,
            },
          });
        }
      }
    } catch (e: any) {
      // Fallback one by one
      for (const userId of userIds) {
        await (prisma as any).notification.create({
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
      { error: err.message || 'Таблица notifications не найдена в базе данных. Выполните SQL запрос на создание.' },
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

    if (!('notification' in prisma)) {
      return NextResponse.json({ success: true });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      await (prisma as any).notification.updateMany({
        where: {
          id: notificationId,
          userId: currentUser.id,
        },
        data: { isRead: true },
      });
    } else {
      await (prisma as any).notification.updateMany({
        where: { userId: currentUser.id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Ошибка обновления статуса' }, { status: 500 });
  }
}
