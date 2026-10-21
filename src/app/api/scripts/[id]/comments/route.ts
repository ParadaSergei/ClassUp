import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/scripts/[id]/comments - Add a comment to a script
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

    const { text } = await request.json();
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Текст комментария не может быть пустым' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId: user.id,
        scriptId: id,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Ошибка при отправке комментария' }, { status: 500 });
  }
}
