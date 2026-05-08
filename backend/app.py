from flask import Flask, request, jsonify, session, redirect, send_from_directory
from functools import wraps
import requests, os, json, secrets, threading, time, uuid, hashlib, hmac
from datetime import datetime, timedelta

app = Flask(__name__, static_folder="../dist", static_url_path="/")
app.secret_key = os.environ.get("SECRET_KEY", "articraft-ultra-secret-2024")

# ========== SOZLAMALAR ==========
ADMIN_USERNAME     = "ArtiAdmin"
ADMIN_PASSWORD     = "ArtiCraft2024!"
TELEGRAM_BOT_TOKEN = "8698585237:AAEhWf6nqxGvJUq8UzHqlW_KY9Lgsd0OMf4"
TELEGRAM_CHAT_IDS  = ["5715390364", "8354817361"]
MIRPAY_SECRET      = os.environ.get("MIRPAY_SECRET", "mirpay-webhook-secret")
MIRPAY_MERCHANT_ID = os.environ.get("MIRPAY_MERCHANT_ID", "YOUR_MERCHANT_ID")
MIRPAY_API_KEY     = os.environ.get("MIRPAY_API_KEY", "YOUR_API_KEY")

DATA_FILE     = "data.json"
ORDERS_FILE   = "orders.json"
_pending_auth = {}
_lock         = threading.Lock()

# ========== MA'LUMOTLAR ==========
DEFAULT_DATA = {
    "ranks": {
        "anarxiya": [
            {"id": "imperator", "name": "Imperator",     "emoji": "😀", "color": "#FFD700", "price_month": 86000,  "price_life": 260000},
            {"id": "general",   "name": "General",       "emoji": "🌛", "color": "#C0C0C0", "price_month": 68000,  "price_life": 200000},
            {"id": "afsona",    "name": "Afsona",        "emoji": "💀", "color": "#9B59B6", "price_month": 48000,  "price_life": 145000},
            {"id": "elita",     "name": "Elita",         "emoji": "⭐️", "color": "#3498DB", "price_month": 37000,  "price_life": 110000},
            {"id": "titan",     "name": "Titan",         "emoji": "⚡️", "color": "#E74C3C", "price_month": 29000,  "price_life": 86000},
            {"id": "alpomish",  "name": "Alpomish",      "emoji": "💎", "color": "#1ABC9C", "price_month": 22000,  "price_life": 68000},
            {"id": "ritsar",    "name": "Ritsar",        "emoji": "⚔️", "color": "#E67E22", "price_month": 16000,  "price_life": 45000},
            {"id": "qahramon",  "name": "Qahramon",      "emoji": "🏅", "color": "#27AE60", "price_month": 10000,  "price_life": 34000},
            {"id": "askar",     "name": "Askar",         "emoji": "✅", "color": "#7F8C8D", "price_month": 6000,   "price_life": 17000}
        ],
        "arti_smp": [
            {"id": "art",       "name": "Art",           "emoji": "👁",  "color": "#E74C3C", "price_month": 30000,  "price_life": None}
        ]
    },
    "tokens": [
        {"amount": 20000, "price": 20000},
        {"amount": 15000, "price": 15000},
        {"amount": 10000, "price": 10000},
        {"amount": 5000,  "price": 5000},
        {"amount": 1000,  "price": 1000}
    ],
    "keys": [
        {"id": "common",    "name": "Common Key",   "emoji": "🔑", "price": 2000,  "color": "#95A5A6"},
        {"id": "crimson",   "name": "Crimson Key",  "emoji": "🔑", "price": 20000, "color": "#E74C3C"},
        {"id": "prime",     "name": "Prime Key",    "emoji": "🔑", "price": 15000, "color": "#3498DB"},
        {"id": "gold",      "name": "Gold Key",     "emoji": "🔑", "price": 15000, "color": "#F39C12"},
        {"id": "amethyst",  "name": "Amethyst Key", "emoji": "🔑", "price": 40000, "color": "#9B59B6"}
    ],
    "shards": [
        {"amount": 500,  "price": 5000},
        {"amount": 1000, "price": 10000},
        {"amount": 2000, "price": 20000}
    ],
    "other": [
        {"id": "unban",     "name": "UNBAN",        "emoji": "🔒", "price": 20000, "desc": "Banorqali chiqish"},
        {"id": "titul_1",  "name": "Titul 1 harf", "emoji": "😎", "price": 5000,  "desc": "Battle Royale uchun, min 2 ta harf"}
    ],
    "payment_card": "9860140110886403",
    "payment_owner": "Jasur Abdullayev",
    "discord": "https://discord.gg/articraft",
    "telegram": "https://t.me/articraft",
    "server_ip": "play.articraft.uz"
}

def load_data():
    if not os.path.exists(DATA_FILE):
        save_data(DEFAULT_DATA)
        return DEFAULT_DATA
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_orders():
    if not os.path.exists(ORDERS_FILE):
        return []
    with open(ORDERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_orders(orders):
    with open(ORDERS_FILE, "w", encoding="utf-8") as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)

# ========== TELEGRAM ==========
def tg_send(text, markup=None, chat_id=None):
    targets = [chat_id] if chat_id else TELEGRAM_CHAT_IDS
    result  = {"error": "yuborilmadi"}
    for cid in targets:
        payload = {"chat_id": cid, "text": text, "parse_mode": "HTML"}
        if markup:
            payload["reply_markup"] = json.dumps(markup)
        try:
            r = requests.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                json=payload, timeout=10
            )
            result = r.json()
        except Exception as e:
            result = {"error": str(e)}
    return result

def tg_edit(chat_id, msg_id, text):
    try:
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText",
            json={"chat_id": chat_id, "message_id": msg_id, "text": text, "parse_mode": "HTML"},
            timeout=5
        )
    except: pass

def tg_answer(cb_id, text=""):
    try:
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery",
            json={"callback_query_id": cb_id, "text": text}, timeout=5
        )
    except: pass

def tg_polling():
    offset = None
    while True:
        try:
            params = {"timeout": 20, "allowed_updates": ["callback_query"]}
            if offset: params["offset"] = offset
            r    = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates", params=params, timeout=25)
            data = r.json()
            if not data.get("ok"):
                time.sleep(5); continue
            for upd in data.get("result", []):
                offset = upd["update_id"] + 1
                cb = upd.get("callback_query")
                if not cb: continue
                cb_data = cb.get("data", "")
                cid     = cb["message"]["chat"]["id"]
                mid     = cb["message"]["message_id"]

                if cb_data.startswith("auth_approve_"):
                    code = cb_data[13:]
                    with _lock:
                        if code in _pending_auth: _pending_auth[code]["ok"] = True
                    tg_answer(cb["id"], "✅ Tasdiqlandi!")
                    tg_edit(cid, mid, "✅ <b>Admin kirishi TASDIQLANDI</b>")

                elif cb_data.startswith("auth_reject_"):
                    code = cb_data[12:]
                    with _lock:
                        if code in _pending_auth: _pending_auth[code]["ok"] = False
                    tg_answer(cb["id"], "❌ Rad etildi!")
                    tg_edit(cid, mid, "❌ <b>Admin kirishi RAD ETILDI</b>")

                elif cb_data.startswith("order_done_"):
                    oid = cb_data[11:]
                    _complete_order(oid, "completed")
                    tg_answer(cb["id"], "✅ Bajarildi!")
                    tg_edit(cid, mid, f"✅ <b>#{oid} order BAJARILDI</b>")

                elif cb_data.startswith("order_cancel_"):
                    oid = cb_data[13:]
                    _complete_order(oid, "cancelled")
                    tg_answer(cb["id"], "❌ Bekor qilindi!")
                    tg_edit(cid, mid, f"❌ <b>#{oid} order BEKOR QILINDI</b>")

        except: time.sleep(5)

def _complete_order(order_id, status):
    orders = load_orders()
    for o in orders:
        if o["id"] == order_id:
            o["status"]     = status
            o["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            save_orders(orders)
            break

threading.Thread(target=tg_polling, daemon=True).start()

# ========== AUTH ==========
def admin_required(f):
    @wraps(f)
    def dec(*a, **kw):
        if not session.get("admin"):
            return jsonify({"error": "Ruxsat yo'q"}), 401
        return f(*a, **kw)
    return dec

# ========== MIRPAY ==========
def create_mirpay_payment(order_id, amount, description):
    """MirPay orqali to'lov yaratish"""
    try:
        r = requests.post(
            "https://api.mirpay.uz/v1/payments/create",
            headers={
                "Authorization": f"Bearer {MIRPAY_API_KEY}",
                "Content-Type":  "application/json"
            },
            json={
                "merchant_id":  MIRPAY_MERCHANT_ID,
                "amount":        amount,
                "currency":      "UZS",
                "order_id":      order_id,
                "description":   description,
                "return_url":    f"https://articraft.uz/donate/success?order={order_id}",
                "webhook_url":   f"https://articraft.uz/api/webhook/mirpay"
            },
            timeout=10
        )
        return r.json()
    except Exception as e:
        return {"error": str(e)}

def verify_mirpay_webhook(payload, signature):
    """MirPay webhook imzosini tekshirish"""
    expected = hmac.new(
        MIRPAY_SECRET.encode(),
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

# ========== PUBLIC API ==========

@app.route("/api/data")
def get_public_data():
    data = load_data()
    return jsonify(data)

@app.route("/api/orders", methods=["POST"])
def create_order():
    body = request.json or {}
    username  = body.get("username", "").strip()
    item_type = body.get("type", "")       # rank | token | key | shard | other
    item_id   = body.get("item_id", "")
    duration  = body.get("duration", "month")  # month | life
    quantity  = int(body.get("quantity", 1))
    amount    = int(body.get("amount", 0))
    server    = body.get("server", "anarxiya") # anarxiya | arti_smp

    if not username or not amount:
        return jsonify({"error": "username va amount majburiy"}), 400

    order = {
        "id":          str(uuid.uuid4())[:8].upper(),
        "username":    username,
        "type":        item_type,
        "item_id":     item_id,
        "duration":    duration,
        "quantity":    quantity,
        "amount":      amount,
        "server":      server,
        "status":      "pending_payment",
        "payment_id":  None,
        "payment_url": None,
        "created_at":  datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "updated_at":  None
    }

    desc = f"ArtiCraft | {username} | {item_type} {item_id}"
    pay  = create_mirpay_payment(order["id"], amount, desc)

    if "error" in pay:
        # MirPay sozlanmagan => manual rejim
        order["status"]      = "pending_manual"
        order["payment_url"] = None
    else:
        order["status"]      = "pending_payment"
        order["payment_id"]  = pay.get("payment_id")
        order["payment_url"] = pay.get("payment_url")

    orders = load_orders()
    orders.append(order)
    save_orders(orders)

    # Telegram xabari
    msg = (
        f"🛒 <b>Yangi Donate So'rovi</b>\n\n"
        f"👤 Oyinchi: <code>{username}</code>\n"
        f"🎮 Server: {server}\n"
        f"📦 Mahsulot: {item_type} — {item_id}\n"
        f"⏱ Muddat: {duration}\n"
        f"💰 Summa: <b>{amount:,} so'm</b>\n"
        f"🆔 Order: <code>{order['id']}</code>\n"
        f"📅 Vaqt: {order['created_at']}\n\n"
        f"{'✅ To\'lov kutilmoqda' if order['status'] == 'pending_payment' else '⚠️ Qo\'lda tasdiqlash kerak'}"
    )
    markup = {"inline_keyboard": [[
        {"text": "✅ Bajarildi", "callback_data": f"order_done_{order['id']}"},
        {"text": "❌ Bekor",     "callback_data": f"order_cancel_{order['id']}"}
    ]]}
    tg_send(msg, markup)

    return jsonify({
        "success":     True,
        "order_id":    order["id"],
        "payment_url": order["payment_url"],
        "manual":      order["status"] == "pending_manual"
    }), 201

@app.route("/api/orders/<order_id>")
def get_order(order_id):
    for o in load_orders():
        if o["id"] == order_id:
            return jsonify(o)
    return jsonify({"error": "Topilmadi"}), 404

@app.route("/api/webhook/mirpay", methods=["POST"])
def mirpay_webhook():
    sig     = request.headers.get("X-MirPay-Signature", "")
    payload = request.json or {}

    if not verify_mirpay_webhook(payload, sig):
        return jsonify({"error": "Invalid signature"}), 403

    order_id = payload.get("order_id")
    status   = payload.get("status")

    if status == "paid":
        _complete_order(order_id, "paid")
        # Adminlarga xabar
        for o in load_orders():
            if o["id"] == order_id:
                msg = (
                    f"💳 <b>TO'LOV QABUL QILINDI</b>\n\n"
                    f"👤 {o['username']}\n"
                    f"📦 {o['type']} — {o['item_id']}\n"
                    f"💰 {o['amount']:,} so'm\n"
                    f"🆔 {order_id}\n\n"
                    f"⚡️ Oyindagi bonus bering!"
                )
                markup = {"inline_keyboard": [[
                    {"text": "✅ Bonus Berildi", "callback_data": f"order_done_{order_id}"}
                ]]}
                tg_send(msg, markup)
                break

    return jsonify({"ok": True})

# ========== ADMIN API ==========

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.json or {}
    if data.get("username") != ADMIN_USERNAME or data.get("password") != ADMIN_PASSWORD:
        return jsonify({"error": "Noto'g'ri"}), 401

    code    = secrets.token_hex(16)
    expires = time.time() + 300
    with _lock:
        _pending_auth[code] = {"ok": None, "expires": expires}

    ip  = request.headers.get("X-Forwarded-For", request.remote_addr)
    ua  = request.headers.get("User-Agent", "")[:60]
    msg = (
        f"🔐 <b>ArtiCraft Admin Kirish</b>\n\n"
        f"👤 {data['username']}\n"
        f"🌐 IP: <code>{ip}</code>\n"
        f"📱 {ua}\n\n"
        f"<b>Ruxsat berasizmi?</b>"
    )
    markup = {"inline_keyboard": [[
        {"text": "✅ Ha", "callback_data": f"auth_approve_{code}"},
        {"text": "❌ Yo'q", "callback_data": f"auth_reject_{code}"}
    ]]}
    res = tg_send(msg, markup)
    if not res.get("ok"):
        return jsonify({"error": f"Telegram xato: {res.get('description', res)}"}), 500

    return jsonify({"code": code, "wait": True})

@app.route("/api/admin/check", methods=["POST"])
def admin_check():
    code = (request.json or {}).get("code", "")
    with _lock:
        entry = _pending_auth.get(code)
    if not entry or time.time() > entry["expires"]:
        _pending_auth.pop(code, None)
        return jsonify({"status": "expired"})
    if entry["ok"] is True:
        _pending_auth.pop(code, None)
        session["admin"] = True
        return jsonify({"status": "approved"})
    if entry["ok"] is False:
        _pending_auth.pop(code, None)
        return jsonify({"status": "rejected"})
    return jsonify({"status": "pending"})

@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.pop("admin", None)
    return jsonify({"ok": True})

@app.route("/api/admin/orders")
@admin_required
def admin_orders():
    orders = load_orders()
    orders.sort(key=lambda x: x.get("created_at",""), reverse=True)
    return jsonify({"orders": orders, "total": len(orders)})

@app.route("/api/admin/orders/<oid>/status", methods=["POST"])
@admin_required
def admin_order_status(oid):
    status = (request.json or {}).get("status")
    _complete_order(oid, status)
    return jsonify({"ok": True})

@app.route("/api/admin/data", methods=["GET"])
@admin_required
def admin_get_data():
    return jsonify(load_data())

@app.route("/api/admin/data", methods=["POST"])
@admin_required
def admin_save_data():
    new_data = request.json
    if not new_data:
        return jsonify({"error": "Bo'sh"}), 400
    save_data(new_data)
    return jsonify({"ok": True})

@app.route("/api/admin/stats")
@admin_required
def admin_stats():
    orders = load_orders()
    total  = sum(o["amount"] for o in orders if o["status"] in ("paid","completed"))
    return jsonify({
        "total_orders":    len(orders),
        "pending":         sum(1 for o in orders if "pending" in o["status"]),
        "completed":       sum(1 for o in orders if o["status"] in ("paid","completed")),
        "cancelled":       sum(1 for o in orders if o["status"] == "cancelled"),
        "total_revenue":   total
    })

# ========== SPA SERVE ==========
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    dist = os.path.join(app.static_folder, path)
    if path and os.path.exists(dist):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    print("🚀 ArtiCraft Donate Backend ishga tushdi!")
    app.run(debug=True, host="0.0.0.0", port=5000)
