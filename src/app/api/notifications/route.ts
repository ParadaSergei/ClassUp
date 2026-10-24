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

    let notifications: any[] = [];
    let unreadCount = 0;

    if ((prisma as any).notification) {
      notifications = await (prisma as any).notification.findMany({
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

      unreadCount = await (prisma as any).notification.count({
        where: {
          userId: currentUser.id,
          isRead: false,
        },
      });
    } else {
      // Raw SQL query fallback
      const rawNotifs: any = await prisma.$queryRaw`
        SELECT n.id, n.message, n.is_read as "isRead", n.created_at as "createdAt", n.script_id as "scriptId",
               s.title as "scriptTitle"
        FROM notifications n
        LEFT JOIN scripts s ON s.id = n.script_id
        WHERE n.user_id = ${currentUser.id}::uuid
        ORDER BY n.created_at DESC
        LIMIT 20
      `.catch(() => []);

      notifications = Array.isArray(rawNotifs) ? rawNotifs : [];

      const countResult: any = await prisma.$queryRaw`
        SELECT COUNT(*)::int as count
        FROM notifications
        WHERE user_id = ${currentUser.id}::uuid AND is_read = false
      `.catch(() => [{ count: 0 }]);

      unreadCount = countResult?.[0]?.count || 0;
    }

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

    // Attempt through Prisma ORM model
    if ((prisma as any).notification) {
      try {
        if ((prisma as any).notification.createMany) {
          await (prisma as any).notification.createMany({
            data: userIds.map((userId: string) => ({
              userId,
              scriptId,
              message: notificationMessage,
            })),
          });
          return NextResponse.json({ success: true, count: userIds.length });
        }
      } catch (e) {
        // Fallback below
      }

      try {
        for (const userId of userIds) {
          await (prisma as any).notification.create({
            data: {
              userId,
              scriptId,
              message: notificationMessage,
            },
          });
        }
        return NextResponse.json({ success: true, count: userIds.length });
      } catch (e) {
        // Fallback to Raw SQL below
      }
    }

    // Direct Raw SQL Fallback
    for (const userId of userIds) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "notifications" ("id", "user_id", "script_id", "message", "is_read", "created_at")
         VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, false, CURRENT_TIMESTAMP)`,
        userId,
        scriptId,
        notificationMessage
      );
    }

    return NextResponse.json({ success: true, count: userIds.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Ошибка отправки уведомления. Проверьте создание таблицы notifications в базе данных.' },
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

    if ((prisma as any).notification) {
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
    } else {
      if (notificationId) {
        await prisma.$executeRawUnsafe(
          `UPDATE "notifications" SET "is_read" = true WHERE "id" = $1::uuid AND "user_id" = $2::uuid`,
          notificationId,
          currentUser.id
        );
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE "notifications" SET "is_read" = true WHERE "user_id" = $1::uuid`,
          currentUser.id
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Ошибка обновления статуса' }, { status: 500 });
  }
}

// DELETE /api/notifications - delete single or all notifications for current user
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    if ((prisma as any).notification) {
      if (notificationId) {
        await (prisma as any).notification.deleteMany({
          where: {
            id: notificationId,
            userId: currentUser.id,
          },
        });
      } else {
        await (prisma as any).notification.deleteMany({
          where: { userId: currentUser.id },
        });
      }
    } else {
      if (notificationId) {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "notifications" WHERE "id" = $1::uuid AND "user_id" = $2::uuid`,
          notificationId,
          currentUser.id
        );
      } else {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "notifications" WHERE "user_id" = $1::uuid`,
          currentUser.id
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Ошибка удаления уведомлений' }, { status: 500 });
  }
}
