import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// PUT /api/admin/scripts/[id] - Update or toggle publish script (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const body = await request.json();
    const { title, situation, description, content, methodTip, categoryId, isPublished } = body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (situation !== undefined) data.situation = situation;
    if (description !== undefined) data.description = description;
    if (content !== undefined) data.content = content;
    if (methodTip !== undefined) data.methodTip = methodTip;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isPublished !== undefined) data.isPublished = Boolean(isPublished);

    const updatedScript = await prisma.script.update({
      where: { id },
      data,
      include: {
        category: true,
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ script: updatedScript });
  } catch (error: any) {
    console.error('Error updating admin script:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE /api/admin/scripts/[id] - Delete script (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    await prisma.script.delete({ where: { id } });

    return NextResponse.json({ message: 'Скрипт успешно удален' });
  } catch (error: any) {
    console.error('Error deleting admin script:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
