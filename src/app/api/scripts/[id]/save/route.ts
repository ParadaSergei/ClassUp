import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/scripts/[id]/save - Toggle save script for user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const existing = await prisma.savedScript.findUnique({
      where: {
        userId_scriptId: {
          userId: user.id,
          scriptId: id,
        },
      },
    });

    if (existing) {
      await prisma.savedScript.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isSaved: false, message: 'Удалено из закладок' });
    } else {
      await prisma.savedScript.create({
        data: {
          userId: user.id,
          scriptId: id,
        },
      });
      return NextResponse.json({ isSaved: true, message: 'Сохранено в закладки' });
    }
  } catch (error: any) {
    console.error('Error toggling saved script:', error);
    return NextResponse.json({ error: 'Ошибка при сохранении скрипта' }, { status: 500 });
  }
}
