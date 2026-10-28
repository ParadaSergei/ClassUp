import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Fetch categories or create defaults if empty
export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    if (categories.length === 0) {
      // Create default categories if database is clean
      await prisma.category.createMany({
        data: [
          { name: 'Родители', slug: 'parents', description: 'Скрипты и сценарии коммуникации с родителями учащихся' },
          { name: 'Школьники', slug: 'students', description: 'Алгоритмы взаимодействия с учениками на уроках и переменах' },
          { name: 'Администрация', slug: 'administration', description: 'Коммуникация с руководством школы и педагогическим коллективом' },
        ],
        skipDuplicates: true,
      });

      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Ошибка загрузки категорий' }, { status: 500 });
  }
}
