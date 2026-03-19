# Тестовое задание: HTML/CSS/JS + админка для GitHub Pages

Проект полностью переведен на чистый фронтенд:

- `HTML/CSS/JS` без backend;
- адаптивная верстка (desktop/mobile, плавное поведение между брейкпоинтами);
- редактируемый контент через `admin.html`;
- редактирование `meta description` и `title`;
- изменение порядка блоков услуг в админке;
- корректная работа на GitHub Pages.

## Структура

- `index.html` — публичная страница;
- `admin.html` — админ-панель;
- `content/default-content.json` — дефолтный контент;
- `static/css/site.css` — стили сайта;
- `static/css/admin-panel.css` — стили админки;
- `static/js/site.js` — рендер контента на странице;
- `static/js/admin-panel.js` — логика админки.

## Как работает админка

1. Откройте `admin.html`.
2. Измените тексты, ссылки, изображения, SEO и порядок карточек.
3. Нажмите `Сохранить`.

Сохранение идет в `localStorage` браузера, поэтому на GitHub Pages все работает без сервера.

Дополнительно:

- `Экспорт JSON` — выгрузка текущего состояния;
- `Импорт JSON` — загрузка и применение ранее сохраненного состояния;
- `Сбросить к дефолту` — возврат к `content/default-content.json`.

## Деплой на GitHub Pages

1. Запушьте изменения в ветку `main`.
2. В репозитории откройте `Settings -> Pages`.
3. В `Build and deployment` выберите:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
4. Сохраните настройки.

Через 1-3 минуты сайт будет доступен по адресу:

`https://<username>.github.io/<repo>/`

Для этого репозитория:

`https://pirogira.github.io/test/`

Админка:

`https://pirogira.github.io/test/admin.html`
