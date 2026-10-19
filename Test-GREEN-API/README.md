# Чат для MAX (GREEN-API)

Небольшое веб-приложение для переписки в MAX через GREEN-API.
Стек: React 19, TypeScript, Vite, Tailwind CSS.

## Что умеет

- Логин по `idInstance` и `apiTokenInstance` из личного кабинета GREEN-API.
  Перед входом проверяется, что инстанс в статусе `authorized` — если нет, покажем ошибку.
  Креды сохраняются в `localStorage`, чтобы не вводить их каждый раз.
- Создание чата по номеру телефона: номер проверяется через `checkAccount`,
  если аккаунта в MAX нет — чат не создастся.
- Отправка текстовых сообщений (`SendMessage`).
- Приём сообщений в реальном времени через Long Polling
  (`ReceiveNotification` + `DeleteNotification`).
- Догрузка истории чата через `GetChatHistory` и имени контакта через `GetContactInfo`.

Работают только текстовые сообщения — голосовые, картинки и стикеры
намеренно отфильтровываются, так как в задании нужен только текст.

## Запуск

Нужен Node.js 20.19+ или 22.13+ — этого требуют Vite 8 и ESLint 10.
Пакетный менеджер — pnpm (в репо лежит `pnpm-lock.yaml`).

```bash
git clone https://github.com/OinkOink-Ed/Test-GREEN-API.git
cd <папка проекта>
pnpm install
pnpm run build
pnpm preview