import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/scripts/[id] - Get single script details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const script = await prisma.script.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true, role: true } },
        ratings: true,
        comments: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        savedBy: user ? { where: { userId: user.id } } : false,
      },
    });

    if (!script) {
      return NextResponse.json({ error: 'Скрипт не найден' }, { status: 404 });
    }

    const ratingsCount = script.ratings.length;
    const ratingSum = script.ratings.reduce((acc, r) => acc + r.value, 0);
    const averageRating = ratingsCount > 0 ? Number((ratingSum / ratingsCount).toFixed(1)) : 0;
    const userRating = user ? script.ratings.find((r) => r.userId === user.id)?.value || null : null;
    const isSaved = user ? (script.savedBy && script.savedBy.length > 0) : false;

    return NextResponse.json(
      {
        script: {
          ...script,
          rating: averageRating,
          avgRating: averageRating,
          ratingsCount,
          userRating,
          isSaved,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching script by id:', error);
    return NextResponse.json({ error: 'Ошибка при получении скрипта' }, { status: 500 });
  }
}

// PUT /api/scripts/[id] - Update script (Admin or Author)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const script = await prisma.script.findUnique({ where: { id } });
    if (!script) {
      return NextResponse.json({ error: 'Скрипт не найден' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && script.authorId !== user.id) {
      return NextResponse.json({ error: 'Нет прав для редактирования этого скрипта' }, { status: 403 });
    }

    const body = await request.json();
    const { title, situation, content, methodTip, categoryId, isPublished } = body;

    const updatedScript = await prisma.script.update({
      where: { id },
      data: {
        title: title ?? script.title,
        situation: situation ?? script.situation,
        content: content ?? script.content,
        methodTip: methodTip !== undefined ? methodTip : script.methodTip,
        categoryId: categoryId ?? script.categoryId,
        isPublished: isPublished !== undefined ? isPublished : script.isPublished,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ script: updatedScript });
  } catch (error: any) {
    console.error('Error updating script:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении скрипта' }, { status: 500 });
  }
}

// DELETE /api/scripts/[id] - Delete script (Admin or Author)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const script = await prisma.script.findUnique({ where: { id } });
    if (!script) {
      return NextResponse.json({ error: 'Скрипт не найден' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && script.authorId !== user.id) {
      return NextResponse.json({ error: 'Нет прав для удаления этого скрипта' }, { status: 403 });
    }

    await prisma.script.delete({ where: { id } });

    return NextResponse.json({ message: 'Скрипт успешно удален' });
  } catch (error: any) {
    console.error('Error deleting script:', error);
    return NextResponse.json({ error: 'Ошибка при удалении скрипта' }, { status: 500 });
  }
}
