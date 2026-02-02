# Миграция на Yjs для коллаборации заметок

## Что было сделано

Система коллаборации переписана с кастомной реализации на WebSocket на **Yjs** (CRDT библиотека).

### Преимущества Yjs:

- ✅ Автоматическое разрешение конфликтов через CRDT
- ✅ Гарантированная консистентность без версионирования
- ✅ Оптимистичные обновления (UI не блокируется)
- ✅ Меньше нагрузки на БД (синхронизация дельт, а не полного контента)
- ✅ Проверенная библиотека, используемая в Notion, Linear и других

## Архитектура

### Бэкенд

- **Файл**: `backend/src/helpers/yjsWebSocket.ts`
- **Эндпоинт**: `/ws/yjs-notes`
- **Функции**:
  - Создание/получение Y.Doc для каждой заметки
  - Синхронизация через WebSocket с бинарным протоколом Yjs
  - Автоматическое сохранение в БД с дебаунсом (2 сек)
  - Управление awareness (курсоры, выделения)

### Фронтенд

- **Провайдер**: `frontend/src/shared/lib/yjs/YjsWebSocketProvider.ts`
- **Хук**: `frontend/src/shared/lib/hooks/useYjsCollaboration.ts`
- **Компонент**: `frontend/src/widgets/noteEditor/ui/CollaborativeNoteEditor.tsx`

## Использование

### В компоненте заметки:

```typescript
import { useYjsCollaboration } from "@/shared/lib/hooks/useYjsCollaboration";

const { isConnected, collaborators, updateContent } = useYjsCollaboration({
  noteId: "123",
  initialContent: content,
  onContentUpdate: (updatedContent) => {
    // Обработка обновлений от других пользователей
  },
});

// Обновлять Yjs при изменении контента
updateContent(newContent);
```

## Установка зависимостей

```bash
# Бэкенд
cd backend
npm install yjs lib0

# Фронтенд
cd frontend
npm install yjs y-protocols lib0
```

## Миграция данных

Старая система (`/ws/notes`) оставлена для обратной совместимости. Новые заметки используют Yjs (`/ws/yjs-notes`).

Для миграции существующих заметок:

1. Загрузить контент из БД
2. Инициализировать Y.Doc с этим контентом
3. Сохранить через Yjs

## Отладка

- Логи бэкенда: `[YjsWS]`
- Логи фронтенда: `[YjsProvider]`, `[YjsCollab]`

## Известные ограничения

1. Awareness (курсоры) реализован упрощенно - можно расширить позже
2. Конвертация BlockNote ↔ Yjs требует доработки для сложных блоков
3. Дебаунс сохранения в БД - 2 секунды (можно настроить)

## Следующие шаги

- [ ] Полная реализация awareness для курсоров и выделений
- [ ] Оптимизация конвертации BlockNote ↔ Yjs
- [ ] Миграция старых заметок на Yjs
- [ ] Удаление старой системы после полной миграции
