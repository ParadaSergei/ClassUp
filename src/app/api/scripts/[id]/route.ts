import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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
