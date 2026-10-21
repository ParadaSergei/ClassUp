import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@classup.ru' },
    update: {},
    create: {
      email: 'admin@classup.ru',
      name: 'Администратор системы',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create Teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@classup.ru' },
    update: {},
    create: {
      email: 'teacher@classup.ru',
      name: 'Мария Иванова (Молодой учитель)',
      password: teacherPassword,
      role: 'TEACHER',
    },
  });

  // Seed Categories
  const categoriesData = [
    { name: 'Работа с родителями', slug: 'parents', description: 'Сценарии взаимодействия с родителями учеников, решения претензий и информирования.' },
    { name: 'Общение с учениками', slug: 'students', description: 'Алгоритмы построения диалога с учащимися, сглаживания саботажа и поддержки.' },
    { name: 'Дисциплина на уроке', slug: 'discipline', description: 'Инструменты управления вниманием и порядка в классе без крика и давления.' },
    { name: 'Разрешение конфликтов', slug: 'conflicts', description: 'Медиация и урегулирование споров между учениками и с участниками образовательного процесса.' },
  ];

  const categoriesMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoriesMap[cat.slug] = created.id;
  }

  // Seed Initial Pedagogical Scripts
  const scriptsData = [
    {
      title: 'Претензия по поводу высокой/низкой оценки',
      situation: 'Родитель звонит или пишет с эмоциональной претензией о том, что его ребенку занизили оценку за контрольную работу.',
      content: '«Здравствуйте, [Имя Родителя]! Я понимаю ваше беспокойство об успеваемости [Имя Ученика]. Оценка выставлена строго на основании единых критериев проверки (показываем работу и критерии). Давайте вместе разберем, какие именно задания вызвали сложности, чтобы [Имя Ученика] смог успешно подтянуть эту тему на следующем занятии.»',
      methodTip: 'Сохраняйте доброжелательный и спокойный тон. Не вступайте в оправдания, опирайтесь на факты и зафиксированные критерии оценивания.',
      categoryId: categoriesMap['parents'],
      authorId: admin.id,
    },
    {
      title: 'Уведомление о системном нарушении дисциплины',
      situation: 'Ученик систематически срывает уроки или отвлекает других, разговоры наедине не дают долгосрочного результата.',
      content: '«Здравствуйте, [Имя Родителя]. Хочу обсудить поведение [Имя Ученика] на занятиях. В последнее время ему тяжело удерживать внимание и следовать общему ритму класса, что мешает его собственному обучению. Предлагаю объединить наши усилия и обсудить, как мы можем помочь ему вовлечься в учебу.»',
      methodTip: 'Формулируйте вопрос не как обвинение («ваш ребенок плохо себя ведет»), а как совместную проблему и заботу об успехах ребенка.',
      categoryId: categoriesMap['parents'],
      authorId: admin.id,
    },
    {
      title: 'Отказ ученика отвечать или выходить к доске',
      situation: 'Ученик замкнулся, стесняется или категорически отказывается выходить к доске во время урока.',
      content: '«Я вижу, что ты сейчас не готов(а) отвечать перед всем классом. Это абсолютно нормально. Давай ты запишешь решение на листочке / ответишь мне на перемене, а в следующий раз мы попробуем вместе у доски.»',
      methodTip: 'Не создавайте публичный конфликт. Снизьте уровень тревожности ученика, предложив альтернативный формат ответа.',
      categoryId: categoriesMap['students'],
      authorId: teacher.id,
    },
    {
      title: 'Использование смартфонов во время урока',
      situation: 'Ученик держит гаджет под партой и отвлекается от работы на уроке.',
      content: '«[Имя Ученика], правила нашего урока одинаковы для всех: телефоны находятся в портфеле. Пожалуйста, убери устройство. Если у тебя важная ситуация и ожидается звонок от родителей — просто предупреди меня заранее.»',
      methodTip: 'Никогда не вырывайте телефон из рук. Апеллируйте к общим правилам класса, открытым для всех.',
      categoryId: categoriesMap['discipline'],
      authorId: admin.id,
    },
    {
      title: 'Конфликт и перепалка между учениками на перемене',
      situation: 'Два ученика громко спорят и готовятся перейти к драке.',
      content: '«Так, стоп! Давайте сделаем паузу. Вы оба сейчас взволнованы. Сделайте глубокий вдох. [Ученик А], расскажи свою версию без перебиваний. Затем [Ученик Б] расскажет свою. Мы найдем справедливое решение прямо сейчас.»',
      methodTip: 'Физически разведите участников конфликта на безопасный шаг. Дайте каждому высказаться без эмоций.',
      categoryId: categoriesMap['conflicts'],
      authorId: teacher.id,
    },
    {
      title: 'Шум и отсутствие внимания во время важной темы',
      situation: 'Класс шумит после перемены и долго не может войти в рабочий ритм.',
      content: '«Ребята, я жду полной тишины через 3... 2... 1. Спасибо тем, кто уже готов слушать. [Имя], мы ждем тебя, чтобы начать интересную тему.»',
      methodTip: 'Используйте невербальный отсчет и паузу. Благодарите собранных учеников, создавая позитивное подкрепление.',
      categoryId: categoriesMap['discipline'],
      authorId: admin.id,
    },
  ];

  for (const scriptData of scriptsData) {
    const script = await prisma.script.create({
      data: scriptData,
    });

    // Add initial ratings & comments
    await prisma.rating.create({
      data: {
        value: 5,
        userId: teacher.id,
        scriptId: script.id,
      },
    });

    await prisma.comment.create({
      data: {
        text: 'Отличный скрипт! Очень помог на прошлой неделе при общении с родителем.',
        userId: teacher.id,
        scriptId: script.id,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
