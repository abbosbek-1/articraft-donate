# ArtiCraft Donate Sayt — O'rnatish

## Loyiha tuzilmasi
```
articraft/
├── backend/
│   ├── app.py          ← Flask backend
│   ├── requirements.txt
│   └── dist/           ← Build qilingandan keyn shu yerda bo'ladi
├── src/                ← React frontend
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 1. Frontend Build
```bash
cd articraft/
npm install
npm run build
# dist/ papkasi backend/ ichida yaratiladi
```

## 2. Backend O'rnatish
```bash
cd backend/
pip install -r requirements.txt
python app.py
```

## 3. MirPay Sozlash
`app.py` ichida:
```python
MIRPAY_MERCHANT_ID = "sizning_merchant_id"
MIRPAY_API_KEY     = "sizning_api_key"
MIRPAY_SECRET      = "sizning_webhook_secret"
```

MirPay dashboard da webhook URL:
```
https://sizning-sayt.uz/api/webhook/mirpay
```

## 4. Nginx Config
```nginx
server {
    listen 80;
    server_name articraft.uz;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 5. PM2 bilan ishga tushirish
```bash
cd backend/
pm2 start "gunicorn -w 4 -b 0.0.0.0:5000 app:app" --name articraft
pm2 save
```

## Admin Panel
- URL: `https://sizning-sayt.uz/admin`
- Login: `ArtiAdmin`
- Parol: `ArtiCraft2024!`
- Tasdiqlash: Telegram orqali

## Xususiyatlar
- ✅ Auto MirPay webhook to'lov
- ✅ 2 server: Anarxiya + Arti SMP
- ✅ Ranklar, Tokenlar, Kalitlar, Shardlar
- ✅ Admin panel: orderlar boshqarish
- ✅ Narxlarni admin paneldan o'zgartirish
- ✅ Telegram bildirishnomalar
- ✅ Telegram 2FA login
