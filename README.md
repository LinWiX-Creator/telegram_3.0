# Telegram MVP (Web + Realtime + Supabase + Node.js)

Ниже — **полный понятный гайд с нуля** для новичка: как поднять MVP-мессенджер (по стилю близкий к Telegram), где у каждого пользователя есть **уникальный ID** вида `user_xxxxxxxxxxxx`.

---

## Что уже есть в этом репозитории

- `backend/` — Node.js API + Socket.IO realtime + Supabase.
- `frontend/` — Web клиент (React + Vite), современный UI в стиле Telegram.
- `electron/` — десктоп-обёртка для сборки `.exe`.

---

## Шаг 1: Установка

### 1.1 Установи ПО

1. Node.js LTS (18+).
2. Git.
3. Android Studio (для APK).
4. Java 17 (для Android-сборки).

Проверь в CMD:

```cmd
node -v
npm -v
git --version
java -version
```

---

## Шаг 2: Создание проекта (CMD команды)

> Если создаёшь с нуля в новой папке, используй команды ниже.

### 2.1 Создать папки

```cmd
mkdir telegram_mvp
cd telegram_mvp
mkdir backend
mkdir backend\middleware
mkdir backend\services
mkdir frontend
mkdir frontend\src
mkdir frontend\src\components
mkdir electron
```

### 2.2 Создать пустые файлы

```cmd
type nul > backend\server.js
type nul > backend\supabase.js
type nul > backend\middleware\auth.js
type nul > backend\services\userService.js
type nul > backend\services\chatService.js
type nul > backend\package.json
type nul > backend\.env.example

type nul > frontend\package.json
type nul > frontend\vite.config.js
type nul > frontend\index.html
type nul > frontend\.env.example
type nul > frontend\src\main.jsx
type nul > frontend\src\App.jsx
type nul > frontend\src\api.js
type nul > frontend\src\styles.css
type nul > frontend\src\components\AuthView.jsx
type nul > frontend\src\components\Sidebar.jsx
type nul > frontend\src\components\ChatWindow.jsx

type nul > electron\package.json
type nul > electron\main.js
type nul > electron\preload.js
```

### 2.3 Как записывать код в файл через CMD

Способ 1 (просто): открыть в VS Code и вставить код.

```cmd
code .
```

Способ 2 (чистый CMD):

```cmd
copy con backend\server.js
```

- Вставь код.
- Нажми `Ctrl+Z`, затем `Enter` для сохранения.

---

## Шаг 3: Код файлов

Ниже кратко: что делает каждый файл.

## Backend

- `backend/server.js` — API (регистрация/логин/поиск по ID/сообщения) + Socket.IO realtime.
- `backend/supabase.js` — подключение к Supabase через service key.
- `backend/middleware/auth.js` — проверка JWT-токена.
- `backend/services/userService.js` — регистрация, логин, генерация ID `user_...`, поиск пользователя.
- `backend/services/chatService.js` — отправка, получение сообщений, список диалогов.
- `backend/.env.example` — пример переменных окружения.

## Frontend

- `frontend/src/App.jsx` — главный экран, авторизация, диалоги, realtime-события.
- `frontend/src/api.js` — все HTTP-запросы + Socket.IO клиент.
- `frontend/src/components/AuthView.jsx` — регистрация/вход.
- `frontend/src/components/Sidebar.jsx` — профиль, свой ID, копирование ID, поиск по ID, список диалогов.
- `frontend/src/components/ChatWindow.jsx` — окно чата и отправка сообщений.
- `frontend/src/styles.css` — современный тёмный дизайн в стиле Telegram.

## Desktop

- `electron/main.js` — запуск web-клиента в desktop-окне.
- `electron/preload.js` — безопасный bridge.

---

## Шаг 4: База данных (Supabase, бесплатно)

### 4.1 Создай проект в Supabase

1. Перейди на [https://supabase.com](https://supabase.com)
2. New project.
3. Возьми:
   - `Project URL`
   - `service_role key` (Settings → API)

### 4.2 Выполни SQL в SQL Editor

```sql
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null,
  username text unique not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists messages (
  id bigint generated always as identity primary key,
  conversation_key text not null,
  from_user_id text not null,
  to_user_id text not null,
  text text not null,
  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation_key on messages(conversation_key);
create index if not exists idx_messages_from_user_id on messages(from_user_id);
create index if not exists idx_messages_to_user_id on messages(to_user_id);
```

### 4.3 Настрой `.env`

Скопируй примеры:

```cmd
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Открой и заполни:

#### `backend/.env`

```env
PORT=4000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_long_secret_string
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

#### `frontend/.env`

```env
VITE_API_URL=http://localhost:4000
```

---

## Шаг 5: Запуск

### 5.1 Установить зависимости

```cmd
cd backend
npm install
cd ..\frontend
npm install
cd ..\electron
npm install
cd ..
```

### 5.2 Запустить backend

```cmd
cd backend
npm run dev
```

### 5.3 В новом окне CMD запустить frontend

```cmd
cd frontend
npm run dev
```

Открой браузер: `http://localhost:5173`

### 5.4 Проверка функций

1. Зарегистрируй 2 аккаунта.
2. У каждого покажется свой `user_...` ID.
3. Скопируй ID кнопкой `Копировать ID`.
4. Найди другого пользователя по ID.
5. Отправь сообщение по ID.
6. Убедись, что чат обновляется realtime без F5.

---

## Шаг 6: APK (Android через Capacitor)

### 6.1 Добавить Capacitor во frontend

```cmd
cd frontend
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init TelegramMVP com.example.telegrammvp --web-dir=dist
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

### 6.2 Сборка APK в Android Studio

1. В Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**.
2. Получишь APK-файл для установки.

> Для production укажи в `frontend/.env` URL backend на Render/Railway.

---

## Шаг 7: EXE (Windows через Electron)

### 7.1 Запуск desktop-версии

Сначала запусти backend и frontend локально, затем:

```cmd
cd electron
npm start
```

### 7.2 Сборка `.exe`

```cmd
cd electron
npm run dist
```

Готовый `.exe` будет в `electron/dist`.

---

## Бесплатные сервисы (рекомендация)

- **База данных**: Supabase Free.
- **Backend**: Render Free Web Service или Railway Free Trial.
- **Realtime**: Socket.IO (в этом проекте) или Supabase Realtime.
- **Frontend hosting**: Vercel/Netlify free.

---

## Как деплоить (коротко)

1. Залей репозиторий в GitHub.
2. Deploy backend на Render:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Variables: из `backend/.env`.
3. Deploy frontend на Vercel:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output: `dist`
   - ENV: `VITE_API_URL=https://your-backend.onrender.com`

---

## Важное по безопасности (для MVP)

Сейчас пароли хэшируются SHA-256 (просто и быстро для старта). Для production лучше перейти на `bcrypt` + salt, добавить rate-limit и email verification.

---

Готово: это полноценный MVP мессенджера с регистрацией, логином, уникальными ID, поиском пользователя по ID, отправкой сообщений по ID, списком диалогов, хранением в Supabase и realtime-чатом.
