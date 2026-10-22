import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

// GET /api/excel/export - Export scripts, users, or comments to .xlsx
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'scripts'; // 'scripts', 'users', or 'comments'

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
          'Категория': s.category?.name || 'Без категории',
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
    } else if (type === 'users') {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
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
        'Статус аккаунта': u.isActive ? 'Активен' : 'Заблокирован',
        'Создано скриптов': u._count.scripts,
        'Поставлено оценок': u._count.ratings,
        'Оставлено комментариев': u._count.comments,
        'Дата регистрации': u.createdAt.toISOString().split('T')[0],
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Пользователи');
    } else if (type === 'comments') {
      const comments = await prisma.comment.findMany({
        include: {
          user: { select: { name: true, email: true } },
          script: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const excelData = comments.map((c) => ({
        ID: c.id,
        'Текст комментария': c.text,
        'Автор': c.user ? c.user.name : 'Аноним',
        'Email автора': c.user ? c.user.email : '',
        'Скрипт': c.script ? c.script.title : '',
        'Дата создания': c.createdAt.toISOString().split('T')[0],
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Комментарии');
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

// POST /api/excel/import - Mass import scripts or users from .xlsx file
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const importType = (formData.get('type') as string) || 'scripts'; // 'scripts' or 'users'

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

    let importedCount = 0;
    const errors: string[] = [];

    if (importType === 'users') {
      for (const [index, row] of rows.entries()) {
        const name = row['ФИО / Имя'] || row['Имя'] || row['Name'] || row['name'];
        const email = row['Email'] || row['email'];
        const password = row['Пароль'] || row['Password'] || 'DefaultPassword123';
        const role = row['Роль'] || row['Role'];

        if (!name || !email) {
          errors.push(`Строка ${index + 2}: Отсутствует имя или email`);
          continue;
        }

        const cleanEmail = String(email).toLowerCase().trim();
        if (!cleanEmail.includes('@')) {
          errors.push(`Строка ${index + 2}: Некорректный email ${cleanEmail}`);
          continue;
        }

        const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existing) {
          errors.push(`Строка ${index + 2}: Пользователь ${cleanEmail} уже существует`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(String(password), 10);
        await prisma.user.create({
          data: {
            name: String(name).trim(),
            email: cleanEmail,
            password: hashedPassword,
            role: String(role).toUpperCase().includes('ADMIN') ? 'ADMIN' : 'USER',
            isActive: true,
          },
        });
        importedCount++;
      }
    } else {
      const categories = await prisma.category.findMany();
      const defaultCategory = categories[0];

      for (const [index, row] of rows.entries()) {
        const title = row['Заголовок'] || row['Title'] || row['title'];
        const situation = row['Ситуация'] || row['Situation'] || row['situation'];
        const content = row['Текст скрипта / фраза'] || row['Текст'] || row['Content'] || row['content'];
        const methodTip = row['Методический совет'] || row['Совет'] || row['MethodTip'] || row['methodTip'];
        const categoryName = row['Категория'] || row['Category'];

        if (!title || !content) {
          errors.push(`Строка ${index + 2}: Заголовок и текст обязательны`);
          continue;
        }

        let matchedCategory = categories.find(
          (c) => c.name.toLowerCase() === String(categoryName || '').toLowerCase()
        );
        if (!matchedCategory) matchedCategory = defaultCategory;

        await prisma.script.create({
          data: {
            title: String(title).trim(),
            situation: situation ? String(situation).trim() : String(title).trim(),
            content: String(content).trim(),
            methodTip: methodTip ? String(methodTip).trim() : null,
            categoryId: matchedCategory?.id,
            authorId: user.id,
            isPublished: true,
          },
        });

        importedCount++;
      }
    }

    return NextResponse.json({
      message: `Успешно импортировано записей: ${importedCount}.${
        errors.length > 0 ? ` Замечаний: ${errors.length}` : ''
      }`,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error importing Excel:', error);
    return NextResponse.json({ error: 'Ошибка при импорте Excel файла' }, { status: 500 });
  }
}
