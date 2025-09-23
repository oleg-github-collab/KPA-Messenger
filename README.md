# Kaminskyi AI Messenger

Двомовний (uk/en) месенджер у стилі Google Meet: хост (Oleh) авторизується за наперед заданими обліковими даними, генерує одноразові посилання на зустрічі, спілкується у текстовому чаті й миттєво під’єднується до відео/аудіо виклику з гостем. Socket.IO відповідає за сигналінг WebRTC та обмін повідомленнями, SQLite зберігає історію зустрічі, а Railway легко приймає застосунок у продакшн.

A bilingual (uk/en) Google Meet–style messenger: the host (Oleh) authenticates with pre-provisioned credentials, generates single-use meeting links, chats in real time, and jumps on a WebRTC call with a guest. Socket.IO handles signaling + messaging, SQLite keeps per-meeting history, and Railway deployment stays straightforward.

## Основні можливості / Key features
- 🔐 Авторизація тільки для двох акаунтів (Oleh і Guest) через значення `.env`.
- 🔗 Генерація одноразових посилань на зустріч, які перестають працювати після завершення.
- 💬 Миттєві текстові повідомлення збережені у SQLite для кожної зустрічі.
- 🎥 WebRTC відео/аудіо виклики з попередньо налаштованим STUN; можна додати TURN.
- 🖥️ Двомовний UI (англійська ↔ українська) з перемикачем мови в реальному часі.
- 📱 Мобільна верстка з плаваючим відео-вікном (Mini view) та PiP для браузерів, що підтримують режим picture-in-picture.
- ☁️ Railway-ready конфіг: `railway.json`, `package.json` зі `start`/`build`.

## Швидкий старт локально / Quick local start
1. Встановіть залежності / Install dependencies
   ```bash
   npm install
   ```
2. Створіть файл `.env` з прикладу / Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
3. Запустіть сервер / Run the server
   ```bash
   npm start
   ```
4. Відкрийте / Open <http://localhost:3000>.
5. Увійдіть / Log in як `Oleh` / `chugunnYSkorohod362210$`.
6. Створіть посилання, поділіться ним і приєднайтесь до зустрічі. Гість лише вводить ім’я.

## Деплой на Railway / Railway deployment
- Railway автоматично визначає Node.js проєкт, але ми також додали `railway.json` із командами `npm install` (build) та `npm start` (deploy), щоб уникнути помилки «Script start.sh not found».
- Додайте середовищні змінні (див. `.env.example`) у проєкті Railway.
- За потреби підключіть persistent volume, щоб зберігати `db.sqlite` між розгортаннями.

## TURN сервер / TURN server
WebRTC через один STUN працює, якщо мережа не надто сувора. Для стабільної роботи за NAT додайте власні креденшали у `public/client.js` (масив `iceServers`).

---
Made for seamless bilingual calls between Oleh and invited guests.
