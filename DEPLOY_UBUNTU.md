# Инструкция по развертыванию бота на Ubuntu сервере

## Требования
- Ubuntu 20.04+ или 22.04 LTS
- Минимум 2GB RAM
- Root доступ или пользователь с sudo правами

## Расположение проекта
Проект должен находиться в директории: `~/bots/che`

**Важно:** Если вы работаете от root, пути будут `/root/bots/che`. Если от обычного пользователя, замените `/root` на `/home/ваш-username` во всех конфигурационных файлах.

---

## Шаг 1: Подготовка сервера

### 1.1 Обновление системы
```bash
# Если работаете от root, можно убрать sudo
apt update && apt upgrade -y
```

### 1.2 Установка необходимых пакетов
```bash
apt install -y curl wget git build-essential python3 python3-pip nodejs npm sqlite3

# Установка python3-venv (важно для создания виртуальных окружений)
# Сначала проверьте версию Python
python3 --version

# Установите соответствующий пакет (замените 3.12 на вашу версию Python)
apt install -y python3.12-venv
# Или для других версий:
# apt install -y python3.11-venv
# apt install -y python3.10-venv
```

### 1.3 Установка Node.js 18+ (если версия старая)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### 1.4 Установка PM2 для управления процессами
```bash
npm install -g pm2
```

---

## Шаг 2: Клонирование проекта

### 2.1 Создание директории для проекта
```bash
mkdir -p ~/bots
cd ~/bots
```

### 2.2 Загрузка проекта
```bash
# Если проект в Git репозитории:
git clone <ваш-репозиторий> che
cd ~/bots/che

# Или загрузите файлы через SCP/SFTP в директорию ~/bots/che
```

---

## Шаг 3: Настройка Python бота

### 3.1 Проверка версии Python и установка venv (если нужно)
```bash
# Проверьте версию Python
python3 --version

# Если venv не установлен, установите соответствующий пакет
# Для Python 3.12:
apt install -y python3.12-venv

# Для Python 3.11:
# apt install -y python3.11-venv

# Для Python 3.10:
# apt install -y python3.10-venv

# Или установите универсальный пакет (если доступен):
apt install -y python3-venv
```

### 3.2 Создание виртуального окружения
```bash
cd ~/bots/che/scripts

# Удалите старую директорию venv, если она была создана с ошибкой
rm -rf venv

# Создайте виртуальное окружение
python3 -m venv venv

# Активируйте виртуальное окружение
source venv/bin/activate
```

### 3.3 Установка Python зависимостей
```bash
pip install --upgrade pip
pip install aiogram pyrogram aiohttp python-dotenv

# Опционально: установка TgCrypto для ускорения работы Pyrogram (рекомендуется)
pip install TgCrypto
```

**Примечание:** TgCrypto значительно ускоряет работу Pyrogram, но не является обязательным. Если установка TgCrypto не удается, бот будет работать, но медленнее.

### 3.4 Создание файла settings.json
```bash
cat > settings.json << 'EOF'
{
    "target_user": "@nznxnxsnsk",
    "admin_ids": [1680022714, 7602550695],
    "allowed_group_id": -1003455281764,
    "topic_launch": 16277,
    "topic_auth": 16279,
    "topic_success": 16283,
    "api_id": 39831972,
    "api_hash": "037087fc71eab9ce52397d7001c31520",
    "api_url": "http://localhost:3000",
    "bot_token": "8398664500:AAHPJpMHUhxp8QiwJlSJKWO_RYZVlRZb-Mc",
    "maintenance_mode": false,
    "banker_session": "main_admin"
}
EOF
```

### 3.5 Создание необходимых директорий
```bash
mkdir -p sessions archive check_photos
chmod 755 sessions archive check_photos
```

---

## Шаг 4: Настройка Next.js приложения

### 4.1 Установка зависимостей
```bash
cd ~/bots/che
npm install
```

### 4.2 Проверка и обновление Next.js (важно для безопасности)
```bash
# Проверьте текущую версию Next.js
npm list next

# Обновите Next.js до последней безопасной версии (16.0.7+ для Next.js 16.x)
npm install next@^16.0.7

# Или используйте автоматический инструмент для проверки и исправления уязвимостей
npx fix-react2shell-next
```

### 4.3 Создание .env файла (если нужен)
```bash
cat > .env.local << 'EOF'
BOT_TOKEN=8398664500:AAHPJpMHUhxp8QiwJlSJKWO_RYZVlRZb-Mc
TELEGRAM_CHAT_ID=6233384461
NODE_ENV=production
EOF
```

### 4.4 Сборка Next.js приложения
```bash
npm run build
```

---

## Шаг 5: Настройка systemd для Python бота

### 5.1 Создание systemd сервиса
```bash
# Если работаете от root, можно убрать sudo
nano /etc/systemd/system/telegram-bot.service
```

### 5.2 Содержимое файла сервиса:
```ini
[Unit]
Description=Telegram Bot Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/bots/che/scripts
Environment="PATH=/root/bots/che/scripts/venv/bin"
ExecStart=/root/bots/che/scripts/venv/bin/python3 main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Примечание:** Если вы работаете не от root, замените `/root` на путь к вашему домашнему каталогу (например, `/home/username`)

### 5.3 Активация и запуск сервиса
```bash
systemctl daemon-reload
systemctl enable telegram-bot.service
systemctl start telegram-bot.service
```

### 5.4 Проверка статуса
```bash
systemctl status telegram-bot.service
```

### 5.5 Просмотр логов
```bash
journalctl -u telegram-bot.service -f
```

---

## Шаг 6: Настройка PM2 для Next.js приложения

### 6.1 Создание PM2 конфигурации
```bash
cd ~/bots/che
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'nextjs-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/root/bots/che',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF
```

**Примечание:** Если вы работаете не от root, замените `/root` на путь к вашему домашнему каталогу

### 6.2 Создание директории для логов
```bash
mkdir -p ~/bots/che/logs
```

### 6.3 Запуск через PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6.4 Полезные команды PM2
```bash
pm2 status          # Статус процессов
pm2 logs nextjs-app # Просмотр логов
pm2 restart nextjs-app # Перезапуск
pm2 stop nextjs-app   # Остановка
```

---

## Шаг 7: Настройка Nginx (опционально, для домена)

### 7.1 Установка Nginx
```bash
apt install -y nginx
```

### 7.2 Создание конфигурации
```bash
nano /etc/nginx/sites-available/telegram-bot
```

### 7.3 Содержимое конфигурации:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.4 Активация конфигурации
```bash
ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Шаг 8: Настройка файрвола

### 8.1 Разрешение необходимых портов
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp     # HTTP (если используете Nginx)
ufw allow 443/tcp    # HTTPS (если используете SSL)
ufw enable
```

---

## Шаг 9: Настройка SSL сертификата (опционально, для HTTPS)

### 9.1 Установка Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 9.2 Получение сертификата
```bash
certbot --nginx -d your-domain.com
```

---

## Шаг 10: Первоначальная настройка бота

### 10.1 Подключение банкира (первый запуск)
```bash
# Бот должен быть запущен
# Отправьте команду /admin в боте
# Следуйте инструкциям для подключения банкира
```

### 10.2 Проверка работы
```bash
# Проверьте логи бота
journalctl -u telegram-bot.service -n 50

# Проверьте логи Next.js
pm2 logs nextjs-app
```

---

## Полезные команды для управления

### Управление Python ботом
```bash
systemctl start telegram-bot.service    # Запуск
systemctl stop telegram-bot.service     # Остановка
systemctl restart telegram-bot.service # Перезапуск
systemctl status telegram-bot.service   # Статус
```

### Управление Next.js приложением
```bash
pm2 start nextjs-app    # Запуск
pm2 stop nextjs-app     # Остановка
pm2 restart nextjs-app  # Перезапуск
pm2 delete nextjs-app   # Удаление из PM2
```

### Просмотр логов
```bash
# Логи Python бота
journalctl -u telegram-bot.service -f

# Логи Next.js
pm2 logs nextjs-app

# Логи Nginx
tail -f /var/log/nginx/error.log
```

### Обновление проекта
```bash
cd ~/bots/che
git pull  # Если используете Git

# Обновите зависимости (включая Next.js для безопасности)
npm install

# Проверьте и обновите Next.js до безопасной версии (если нужно)
npm install next@^16.0.7

# Пересоберите Next.js приложение
npm run build

# Перезапуск сервисов
systemctl restart telegram-bot.service
pm2 restart nextjs-app
```

---

## Решение проблем

### Ошибка при создании виртуального окружения (venv)
Если вы видите ошибку `ensurepip is not available`:
```bash
# 1. Проверьте версию Python
python3 --version

# 2. Установите соответствующий пакет venv
apt install -y python3.12-venv  # для Python 3.12
# или
apt install -y python3.11-venv  # для Python 3.11
# или
apt install -y python3.10-venv  # для Python 3.10

# 3. Удалите старую директорию venv (если была создана с ошибкой)
rm -rf ~/bots/che/scripts/venv

# 4. Создайте виртуальное окружение заново
cd ~/bots/che/scripts
python3 -m venv venv
```

### Бот не запускается (сервис постоянно перезапускается)
Если сервис показывает статус `activating (auto-restart)` или `failed`:

1. **Просмотрите подробные логи для диагностики:**
```bash
# Последние 100 строк логов
journalctl -u telegram-bot.service -n 100 --no-pager

# Логи в реальном времени
journalctl -u telegram-bot.service -f

# Логи с временными метками
journalctl -u telegram-bot.service --since "10 minutes ago"
```

2. **Проверьте, что бот запускается вручную:**
```bash
cd ~/bots/che/scripts
source venv/bin/activate
python3 main.py
```
Если есть ошибки при ручном запуске, исправьте их сначала.

3. **Проверьте права доступа к файлам:**
```bash
ls -la ~/bots/che/scripts/
chmod +x ~/bots/che/scripts/main.py
chmod 755 ~/bots/che/scripts/sessions
chmod 755 ~/bots/che/scripts/archive
```

4. **Проверьте наличие всех зависимостей:**
```bash
cd ~/bots/che/scripts
source venv/bin/activate
pip list
# Убедитесь, что установлены: aiogram, pyrogram, aiohttp, python-dotenv
```

5. **Проверьте наличие файла settings.json:**
```bash
ls -la ~/bots/che/scripts/settings.json
cat ~/bots/che/scripts/settings.json
```

6. **Проверьте путь к Python в systemd сервисе:**
```bash
# Убедитесь, что путь к venv правильный
ls -la /root/bots/che/scripts/venv/bin/python3

# Если путь другой, обновите файл сервиса
nano /etc/systemd/system/telegram-bot.service
# После изменений:
systemctl daemon-reload
systemctl restart telegram-bot.service
```

7. **Проверьте рабочую директорию:**
```bash
# Убедитесь, что main.py находится в правильной директории
ls -la /root/bots/che/scripts/main.py
```

### Next.js не запускается
1. Проверьте логи: `pm2 logs nextjs-app`
2. Проверьте порт 3000: `netstat -tulpn | grep 3000`
3. Проверьте переменные окружения: `pm2 env nextjs-app`

### Ошибка "Vulnerable version of Next.js detected"
Если при сборке появляется ошибка о уязвимой версии Next.js:
```bash
cd ~/bots/che

# Обновите Next.js до безопасной версии
npm install next@^16.0.7

# Или используйте автоматический инструмент
npx fix-react2shell-next

# Пересоберите приложение
npm run build
```

### Проблемы с сессиями Pyrogram
1. Убедитесь, что директория `sessions` существует и имеет права записи
2. Проверьте права: `chmod 755 ~/bots/che/scripts/sessions`

### Проблемы с базой данных
1. Проверьте права на файл БД: `chmod 644 ~/bots/che/scripts/bot_database.db`
2. Проверьте наличие SQLite3: `sqlite3 --version`

### Ошибка ImportError при импорте из pyrogram.errors
Если вы видите ошибку типа `cannot import name 'PaymentRequired' from 'pyrogram.errors'`:
```bash
# Это означает, что в коде используется устаревший импорт
# Обновите код, удалив несуществующие импорты
# Или обновите Pyrogram до последней версии:
cd ~/bots/che/scripts
source venv/bin/activate
pip install --upgrade pyrogram
```

### Предупреждение "TgCrypto is missing"
Это не критичная ошибка, но для лучшей производительности установите TgCrypto:
```bash
cd ~/bots/che/scripts
source venv/bin/activate
pip install TgCrypto
```

---

## Мониторинг и обслуживание

### Автоматическая очистка логов
Создайте cron задачу для очистки старых логов:
```bash
crontab -e
```

Добавьте строку:
```
0 0 * * 0 find ~/bots/che/scripts -name "*.log" -mtime +7 -delete
```

### Резервное копирование
Создайте скрипт для бэкапа:
```bash
cat > ~/backup-bot.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/bot-backup-$DATE.tar.gz \
    ~/bots/che/scripts/sessions \
    ~/bots/che/scripts/bot_database.db \
    ~/bots/che/scripts/settings.json

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "bot-backup-*.tar.gz" -mtime +7 -delete
EOF

chmod +x ~/backup-bot.sh
```

Добавьте в crontab для ежедневного бэкапа:
```
0 2 * * * /root/backup-bot.sh
```

**Примечание:** Если вы работаете не от root, замените `/root` на путь к вашему домашнему каталогу

---

## Контакты и поддержка

При возникновении проблем проверьте:
1. Логи сервисов
2. Права доступа к файлам
3. Наличие всех зависимостей
4. Состояние сетевого подключения

---

**Готово!** Ваш бот должен быть запущен и работать на Ubuntu сервере.

