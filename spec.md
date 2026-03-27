# Skill Legends Royale — Главная страница

## Current State
Новый проект, пустой.

## Requested Changes (Diff)

### Add
- Главная страница игры "Skill Legends Royale" в тёмном игровом стиле
- Sticky навигационный хедер с названием игры
- Секция "Персонажи" (65 героев, иконки с именами в grid-сетке)
- Секция "Ветки школы" (13 веток, иконки с именами)
- Секция "Предметы" (99 предметов, иконки с именами)
- Все изображения берутся с say-gg.ru:
  - Герои: https://say-gg.ru/static/heroes/{id}.jpg (1-65)
  - Предметы: https://say-gg.ru/static/items/{id}.jpg (1-99)
  - Ветки: https://say-gg.ru/static/branches/{name}.png
- Встроенная CMS панель (через пароль) для добавления/редактирования/удаления персонажей, веток и предметов
- Authorization компонент для CMS

### Modify
Нечего изменять (новый проект)

### Remove
Ничего

## Implementation Plan

### Backend (Motoko)
- Стабильное хранилище для heroes (Array of {id, name, imageUrl}), branches ({id, name, imageUrl}), items ({id, name, imageUrl})
- Seed данные при инициализации: 65 героев, 99 предметов, 13 веток с URL say-gg.ru
- CRUD: addHero, updateHero, deleteHero, getHeroes
- CRUD: addBranch, updateBranch, deleteBranch, getBranches  
- CRUD: addItem, updateItem, deleteItem, getItems
- Admin авторизация через authorization компонент

### Frontend
- Тёмный gaming стиль (тёмно-синий/чёрный фон, золотые акценты)
- Sticky header с логотипом/названием "Skill Legends Royale"
- Навигация по секциям (Персонажи, Ветки, Предметы)
- Каждая секция: заголовок + responsive grid иконок с подписями
- Иконки: квадратные, с hover-эффектами
- CMS панель: кнопка-замок в хедере, модал с паролем, форма для управления контентом
