import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/scripts - Fetch scripts with search, category filtering, and sorting
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest'; // newest, rating, popular
    const currentUser = await getCurrentUser();

    const where: any = {
      isPublished: true,
    };

    if (category && category !== 'all') {
      where.category = {
        slug: category,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { situation: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const scripts = await prisma.script.findMany({
      where,
      include: {
        category: true,
        author: {
          select: { id: true, name: true, role: true },
        },
        ratings: true,
        comments: {
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        savedBy: currentUser ? { where: { userId: currentUser.id } } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating and format output
    let formattedScripts = scripts.map((script) => {
      const avgRating =
        script.ratings.length > 0
          ? Number((script.ratings.reduce((acc, r) => acc + r.value, 0) / script.ratings.length).toFixed(1))
          : 0;

      const userRating = currentUser
        ? script.ratings.find((r) => r.userId === currentUser.id)?.value || null
        : null;

      const isSaved = currentUser ? (script.savedBy ? script.savedBy.length > 0 : false) : false;

      return {
        id: script.id,
        title: script.title,
        situation: script.situation,
        content: script.content,
        methodTip: script.methodTip,
        category: script.category,
        author: script.author,
        avgRating,
        ratingsCount: script.ratings.length,
        userRating,
        commentsCount: script.comments.length,
        comments: script.comments,
        isSaved,
        createdAt: script.createdAt,
      };
    });

    // Apply sorting
    if (sort === 'rating') {
      formattedScripts.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sort === 'popular') {
      formattedScripts.sort((a, b) => b.ratingsCount + b.commentsCount - (a.ratingsCount + a.commentsCount));
    }

    return NextResponse.json({ scripts: formattedScripts });
  } catch (error: any) {
    console.error('Error fetching scripts:', error);
    return NextResponse.json({ error: 'Ошибка загрузки скриптов' }, { status: 500 });
  }
}

// POST /api/scripts - Create a new script (Admin or Teacher)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await request.json();
    const { title, situation, content, methodTip, categoryId } = body;

    if (!title || !situation || !content || !categoryId) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 });
    }

    const newScript = await prisma.script.create({
      data: {
        title,
        situation,
        content,
        methodTip: methodTip || null,
        categoryId,
        authorId: user.id,
        isPublished: true,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ script: newScript }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating script:', error);
    return NextResponse.json({ error: 'Ошибка при создании скрипта' }, { status: 500 });
  }
}
