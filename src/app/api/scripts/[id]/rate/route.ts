import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/scripts/[id]/rate - Rate script (1-5)
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

    const { value } = await request.json();
    if (typeof value !== 'number' || value < 1 || value > 5) {
      return NextResponse.json({ error: 'Оценка должна быть числом от 1 до 5' }, { status: 400 });
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_scriptId: {
          userId: user.id,
          scriptId: id,
        },
      },
      update: { value },
      create: {
        value,
        userId: user.id,
        scriptId: id,
      },
    });

    // Recalculate average
    const ratings = await prisma.rating.findMany({ where: { scriptId: id } });
    const avgRating = Number((ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length).toFixed(1));

    return NextResponse.json({ rating, avgRating, count: ratings.length });
  } catch (error: any) {
    console.error('Error rating script:', error);
    return NextResponse.json({ error: 'Ошибка при сохранении оценки' }, { status: 500 });
  }
}
