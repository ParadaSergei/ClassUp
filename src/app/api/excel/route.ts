import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import * as XLSX from 'xlsx';

// GET /api/excel/export - Export scripts/users to .xlsx
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'scripts'; // 'scripts' or 'users'

    const workbook = XLSX.utils.book_new();

    if (type === 'scripts') {
      const scripts = await prisma.script.findMany({
        include: {
          category: true,
          author: true,
          ratings: true,
          comments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const excelData = scripts.map((s) => {
        const avgRating =
          s.ratings.length > 0
            ? (s.ratings.reduce((acc, r) => acc + r.value, 0) / s.ratings.length).toFixed(1)
            : '0';

        return {
          ID: s.id,
          'Заголовок': s.title,
          'Ситуация': s.situation,
          'Текст скрипта / фраза': s.content,
          'Методический совет': s.methodTip || '',
          'Категория': s.category.name,
          'Автор': s.author ? s.author.name : 'Система',
          'Опубликован': s.isPublished ? 'Да' : 'Нет',
          'Средний рейтинг': avgRating,
          'Количество оценок': s.ratings.length,
          'Количество комментариев': s.comments.length,
          'Дата создания': s.createdAt.toISOString().split('T')[0],
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Скрипты');
    } else {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: { scripts: true, ratings: true, comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const excelData = users.map((u) => ({
        ID: u.id,
        'ФИО / Имя': u.name,
        Email: u.email,
        'Роль': u.role === 'ADMIN' ? 'Администратор' : 'Учитель',
        'Создано скриптов': u._count.scripts,
        'Поставлено оценок': u._count.ratings,
        'Оставлено комментариев': u._count.comments,
        'Дата регистрации': u.createdAt.toISOString().split('T')[0],
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Пользователи');
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="classup_${type}_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting Excel:', error);
    return NextResponse.json({ error: 'Ошибка при формировании Excel файла' }, { status: 500 });
  }
}

// POST /api/excel/import - Import scripts from .xlsx file
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден в запросе' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<any>(worksheet);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Excel файл не содержит данных' }, { status: 400 });
    }

    // Default category if mapped category not found
    const categories = await prisma.category.findMany();
    const defaultCategory = categories[0];

    let importedCount = 0;

    for (const row of rows) {
      const title = row['Заголовок'] || row['Title'] || row['title'];
      const situation = row['Ситуация'] || row['Situation'] || row['situation'];
      const content = row['Текст скрипта / фраза'] || row['Текст'] || row['Content'] || row['content'];
      const methodTip = row['Методический совет'] || row['Совет'] || row['MethodTip'] || row['methodTip'];
      const categoryName = row['Категория'] || row['Category'];

      if (!title || !situation || !content) {
        continue;
      }

      // Find matching category or use default
      let matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === String(categoryName || '').toLowerCase()
      );
      if (!matchedCategory) matchedCategory = defaultCategory;

      await prisma.script.create({
        data: {
          title: String(title),
          situation: String(situation),
          content: String(content),
          methodTip: methodTip ? String(methodTip) : null,
          categoryId: matchedCategory.id,
          authorId: user.id,
          isPublished: true,
        },
      });

      importedCount++;
    }

    return NextResponse.json({
      message: `Успешно импортировано скриптов: ${importedCount}`,
      importedCount,
    });
  } catch (error: any) {
    console.error('Error importing Excel:', error);
    return NextResponse.json({ error: 'Ошибка при импорте Excel файла' }, { status: 500 });
  }
}
