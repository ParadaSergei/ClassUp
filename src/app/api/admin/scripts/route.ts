import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/admin/scripts - Fetch all scripts including unpublished (Admin only)
export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const scripts = await prisma.script.findMany({
      include: {
        category: true,
        author: {
          select: { id: true, name: true, email: true },
        },
        ratings: true,
        comments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedScripts = scripts.map((s) => {
      const avgRating =
        s.ratings.length > 0
          ? Number((s.ratings.reduce((acc, r) => acc + r.value, 0) / s.ratings.length).toFixed(1))
          : 0;

      return {
        id: s.id,
        title: s.title,
        situation: s.situation,
        description: s.description,
        content: s.content,
        methodTip: s.methodTip,
        category: s.category?.name || 'Без категории',
        categoryId: s.categoryId,
        author: s.author ? s.author.name : 'Система',
        authorEmail: s.author ? s.author.email : '',
        isPublished: s.isPublished,
        avgRating,
        ratingsCount: s.ratings.length,
        commentsCount: s.comments.length,
        createdAt: s.createdAt,
      };
    });

    return NextResponse.json({ scripts: formattedScripts });
  } catch (error: any) {
    console.error('Error fetching admin scripts:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
