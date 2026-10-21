// Sample data for scripts
const scriptsData = [
    {
        id: 1,
        category: 'parents',
        categoryLabel: 'Работа с родителями',
        title: 'Претензия по поводу высокой/низкой оценки',
        preview: 'Как ответить родителям, которые недовольны оценкой ученика за контрольную или ответ.',
        fullText: '«Здравствуйте! Я понимаю ваше беспокойство о успеваемости [Имя ученика]. Оценка выставлена на основании критериев проверки (показываем работу/критерии). Давайте вместе разберем, какие темы вызвали сложности, чтобы улучшить результат на следующем занятии.»',
        tip: 'Сохраняйте спокойный и доброжелательный тон. Опирайтесь на объективные критерии и факты, а не на эмоции.'
    },
    {
        id: 2,
        category: 'parents',
        categoryLabel: 'Работа с родителями',
        title: 'Уведомление о нарушении дисциплины',
        preview: 'Вежливый, но твердый способ сообщить родителям о систематических нарушениях правил школы.',
        fullText: '«Здравствуйте, [Имя Родителя]. Хочу обсудить поведение [Имя Ученика] на уроках. В последнее время ему тяжело удерживать внимание и следовать правилам класса, что мешает его обучению. Предлагаю объединить усилия и обсудить, как мы можем помочь ему адаптивно включиться в работу.»',
        tip: 'Формулируйте вопрос не как обвинение, а как совместную задачу школы и семьи.'
    },
    {
        id: 3,
        category: 'students',
        categoryLabel: 'Общение с учениками',
        title: 'Отказ выходить к доске или отвечать',
        preview: 'Алгоритм действия, когда ученик стесняется или категорически отказывается отвечать.',
        fullText: '«Я вижу, что ты сейчас не готов(а) ответить перед всем классом. Это нормально. Давай ты запишешь краткий ответ на листочке / ответишь мне на перемене, а в следующий раз попробуем у доски.»',
        tip: 'Не давите на ребенка при всем классе. Снизьте уровень тревоги, предложив альтернативный формат ответа.'
    },
    {
        id: 4,
        category: 'discipline',
        categoryLabel: 'Дисциплина на уроке',
        title: 'Шум и разговоры на уроке',
        preview: 'Прием привлечения внимания без крика и срыва голоса.',
        fullText: 'Скрипт "Пауза и обратная связь": «Ребята, я жду полной тишины через 3... 2... 1. Спасибо тем, кто уже готов слушать. [Имя], мы ждем тебя, чтобы начать важную тему.»',
        tip: 'Используйте невербальные сигналы, паузу и благодарите за выполнение правила заранее.'
    },
    {
        id: 5,
        category: 'conflicts',
        categoryLabel: 'Разрешение конфликтов',
        title: 'Ссора или конфликт между учениками на перемене',
        preview: 'Первая помощь и разбор спорной ситуации между школьниками.',
        fullText: '«Так, стоп! Вы оба сейчас взволнованы. Давайте сделаем глубокий вдох. [Ученик А], расскажи свою версию без перебиваний. Затем [Ученик Б] расскажет свою. Мы найдем справедливое решение вместе.»',
        tip: 'Разведите конфликтных учеников на безопасное расстояние и дайте высказаться каждому по очереди.'
    },
    {
        id: 6,
        category: 'students',
        categoryLabel: 'Общение с учениками',
        title: 'Использование смартфона во время занятия',
        preview: 'Реагирование на гаджеты без конфликта и скандала.',
        fullText: '«[Имя], правила нашего урока запрещают использовать телефон. Пожалуйста, убери его в рюкзак до конца занятия. Если нужен срочный вызов от родителей — подними руку и предупреди меня.»',
        tip: 'Не вырывайте гаджет из рук. Напоминайте о единых правилах класса для всех.'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const scriptsGrid = document.getElementById('scriptsGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');
    const addScriptBtn = document.getElementById('addScriptBtn');

    let currentCategory = 'all';
    let searchQuery = '';

    // Render scripts
    function renderScripts() {
        const filtered = scriptsData.filter(script => {
            const matchesCategory = currentCategory === 'all' || script.category === currentCategory;
            const matchesSearch = script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  script.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  script.fullText.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            scriptsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b;">
                    <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">🔍 Сценарии не найдены</p>
                    <p>Попробуйте изменить запрос или выбрать другую категорию.</p>
                </div>
            `;
            return;
        }

        scriptsGrid.innerHTML = filtered.map(script => `
            <div class="card">
                <div>
                    <span class="card-badge">${script.categoryLabel}</span>
                    <h3 class="card-title">${script.title}</h3>
                    <p class="card-preview">${script.preview}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-outline view-btn" data-id="${script.id}">Читать скрипт</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                openModal(id);
            });
        });
    }

    // Filter by Category
    categoryFilter.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag')) {
            document.querySelectorAll('.category-tags .tag').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-category');
            renderScripts();
        }
    });

    // Search input handler
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderScripts();
    });

    // Modal Handlers
    function openModal(scriptId) {
        const script = scriptsData.find(s => s.id === scriptId);
        if (!script) return;

        modalContent.innerHTML = `
            <span class="card-badge">${script.categoryLabel}</span>
            <h2 style="font-size: 1.5rem; margin: 0.5rem 0 1rem; color: #1e293b;">${script.title}</h2>

            <div class="modal-body">
                <h3>🗣️ Рекомендуемый скрипт / фраза:</h3>
                <p>${script.fullText}</p>

                <h3 style="margin-top: 1.5rem;">💡 Методическая рекомендация:</h3>
                <p style="background-color: #fef3c7; border-left-color: #f59e0b;">${script.tip}</p>
            </div>
        `;

        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Add script button action
    addScriptBtn.addEventListener('click', () => {
        alert('Раздел добавления пользовательских скриптов находится в разработке.');
    });

    // Initial render
    renderScripts();
});
