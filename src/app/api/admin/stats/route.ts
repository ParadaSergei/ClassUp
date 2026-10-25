import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/admin/stats - System analytics for charts
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();
    const totalScripts = await prisma.script.count();
    const totalRatings = await prisma.rating.count();
    const totalComments = await prisma.comment.count();

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { scripts: true },
        },
      },
    });

    const categoryStats = categories.map((cat) => ({
      name: cat.name,
      count: cat._count.scripts,
    }));

    const scriptsWithRatings = await prisma.script.findMany({
      include: {
        category: true,
        ratings: true,
        comments: true,
      },
    });

    const topScripts = scriptsWithRatings
      .map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category?.name || 'Без категории',
        avgRating:
          s.ratings.length > 0
            ? Number((s.ratings.reduce((acc, r) => acc + r.value, 0) / s.ratings.length).toFixed(1))
            : 0,
        ratingsCount: s.ratings.length,
        commentsCount: s.comments.length,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalUsers,
        totalScripts,
        totalRatings,
        totalComments,
      },
      categoryStats,
      topScripts,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
