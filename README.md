# Social Routing Generator for MikroTik

[![GitHub license](https://img.shields.io/github/license/yourusername/social-routing)](https://github.com/yourusername/social-routing/blob/main/LICENSE)
[![GitHub Actions](https://github.com/yourusername/social-routing/actions/workflows/update.yml/badge.svg)](https://github.com/yourusername/social-routing/actions)

**سیستم خودکار ساخت و بروزرسانی Address List برای MikroTik جهت ارسال ترافیک سرویس‌های مشخص از مسیر VPN**

این پروژه به صورت خودکار لیست آدرس‌های IP مربوط به سرویس‌های محبوب (مانند متا، تلگرام، گوگل و ...) را استخراج کرده و به عنوان Address List در MikroTik جهت مسیریابی از طریق VPN ارائه می‌دهد.

## 📋 فهرست مطالب

- [معرفی پروژه](#-معرفی-پروژه)
- [معماری پروژه](#-معماری-پروژه)
- [پیش‌نیازها](#-پیش‌نیازها)
- [راه‌اندازی اولیه](#-راه‌اندازی-اولیه)
- [تنظیم GitHub Actions](#-تنظیم-github-actions)
- [راه‌اندازی Cloudflare Worker](#-راه‌اندازی-cloudflare-worker)
- [تنظیمات MikroTik](#-تنظیمات-mikrotik)
- [افزودن سرویس جدید](#-افزودن-سرویس-جدید)
- [نکات تولید (Production)](#-نکات-تولید-production)
- [عکس‌های معماری](#-عکس‌های-معماری)
- [مجوز](#-مجوز)

---

## 🚀 معرفی پروژه

این ابزار با استفاده از **ASN (Autonomous System Number)** سرویس‌های مختلف، **پیشوندهای IPv4** مربوط به آن‌ها را استخراج کرده و یک لیست آدرس‌های IP به‌روز تولید می‌کند. سپس با استفاده از **GitHub Actions** به‌صورت دوره‌ای بروزرسانی شده و از طریق **Cloudflare Worker** در اختیار **MikroTik** قرار می‌گیرد.

### ویژگی‌ها

- ✅ دریافت خودکار **ASN** سرویس‌های مشخص
- ✅ استخراج **Prefixهای IPv4** مربوط به هر ASN
- ✅ تولید فایل **JSON** حاوی لیست IPها
- ✅ بروزرسانی دوره‌ای با **GitHub Actions**
- ✅ ارائه API با **Cloudflare Worker**
- ✅ تنظیم خودکار **Address List** در MikroTik

---

## 🏗 معماری پروژه

```
                    ┌─────────────────┐
                    │   ASN List      │
                    │  (Services)     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   update.js     │
                    │  (Parser)       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  social.json    │
                    │  (IP List)      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  GitHub Actions │
                    │   (CI/CD)       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Cloudflare      │
                    │ Worker (API)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   MikroTik      │
                    │   Scheduler     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Firewall       │
                    │  Address List   │
                    └─────────────────┘
```

---

## 📦 پیش‌نیازها

### نرم‌افزار مورد نیاز

| ابزار | نسخه | توضیحات |
|-------|------|----------|
| Node.js | ≥ 20 | برای اجرای اسکریپت بروزرسانی |
| Git | آخرین نسخه | برای کنترل نسخه |
| GitHub | حساب کاربری | برای میزبانی کد و Actions |
| Cloudflare | حساب کاربری | برای میزبانی Worker |
| MikroTik | RouterOS v7 | برای اعمال تنظیمات مسیریابی |

---

## 🛠 راه‌اندازی اولیه

### 1. Fork یا Clone پروژه

#### روش Fork (توصیه‌شده)

1. وارد صفحه [GitHub پروژه](https://github.com/yourusername/social-routing) شوید.
2. گزینه **Fork** را انتخاب کنید.
3. پروژه در حساب شخصی شما کپی می‌شود.

#### روش Clone

```bash
git clone https://github.com/YOUR_USERNAME/social-routing.git
cd social-routing
```

### 2. نصب وابستگی‌ها

```bash
npm install
```

برای بررسی نسخه‌های نصب‌شده:

```bash
node -v  # باید ≥ v20 باشد
npm -v
```

### 3. تنظیم ASN سرویس‌ها

فایل **`update.js`** را باز کرده و بخش `SERVICES` را ویرایش کنید:

```javascript
const SERVICES = {
    meta: {
        asn: 32934
    },
    telegram: {
        asn: 62041
    },
    google: {
        asn: 15169
    },
    // اضافه کردن سرویس جدید
    netflix: {
        asn: 2906
    }
};
```

> 💡 **نکته:** برای پیدا کردن ASN سرویس‌ها می‌توانید از ابزارهای زیر استفاده کنید:
> - [BGP Lookup](https://bgp.he.net/)
> - [RIPEstat](https://stat.ripe.net/)
> - [Hurricane Electric BGP](https://bgp.he.net/)

### 4. تست تولید لیست

```bash
npm run update
```

**خروجی موفق:**

```
Starting social prefix update...
meta AS32934
telegram AS62041
google AS15169
social.json generated successfully
```

فایل **`social.json`** تولید می‌شود که شامل لیست IPهای مربوط به سرویس‌هاست.

---

## ⚙️ تنظیم GitHub Actions

مسیر فایل: **`.github/workflows/update.yml`**

```yaml
name: Update Social Prefixes

on:
  schedule:
    - cron: "15 */6 * * *"  # هر 6 ساعت یکبار
  workflow_dispatch:         # اجرای دستی

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm install
      - run: npm run update
      
      - run: git config user.name github-actions
      - run: git config user.email github-actions@github.com
      - run: git add social.json
      - run: git commit -m "Update prefixes" || exit 0
      - run: git push
```

> ⏰ **زمان اجرا:** زمان‌بندی بر اساس **UTC** است.

---

## ☁️ راه‌اندازی Cloudflare Worker

### 1. نصب Wrangler

```bash
npm install -g wrangler
```

### 2. ورود به حساب Cloudflare

```bash
wrangler login
```

### 3. ساخت Worker

```bash
wrangler init
```

### 4. تنظیم فایل `wrangler.jsonc`

```jsonc
{
  "name": "social-routing",
  "vars": {
    "GITHUB_JSON_URL": "https://raw.githubusercontent.com/USERNAME/REPOSITORY/main/social.json"
  }
}
```

### 5. Deploy Worker

```bash
wrangler deploy
```

پس از Deploy، آدرس زیر را دریافت می‌کنید:

```
https://your-worker.workers.dev
```

این آدرس، **API مورد استفاده MikroTik** خواهد بود.

---

## 🔧 تنظیمات MikroTik

### 1. ساخت Script

در MikroTik، یک **Script** با نام **`update-social-list`** ایجاد کنید:

```bash
/system script add name=update-social-list source={
    :local url "https://your-worker.workers.dev"
    :local listName "social"
    
    /tool fetch url=$url mode=https dst-path=social.json
    :delay 2s
    
    /ip firewall address-list remove [find list=$listName]
    
    :local data [/file get social.json contents]
    :local parsed [:json $data]
    
    :foreach item in=$parsed do={
        /ip firewall address-list add address=$item->"prefix" list=$listName comment=$item->"service"
    }
    
    /file remove social.json
}
```

### 2. اجرای تستی

```bash
/system script run update-social-list
```

### 3. بررسی لیست تولیدشده

```bash
/ip firewall address-list print where list=social
```

**نمونه خروجی:**

```
# LIST    ADDRESS            COMMENT
0 social  57.144.246.0/23    meta
1 social  149.154.160.0/20   telegram
2 social  173.194.0.0/16     google
```

### 4. تنظیم Scheduler برای بروزرسانی خودکار

```bash
/system scheduler add \
    name=social-update \
    interval=6h \
    on-event=update-social-list
```

از این به بعد، MikroTik هر **۶ ساعت** یکبار لیست را بروزرسانی می‌کند.

### 5. استفاده در Firewall / Routing

پس از ایجاد Address List، می‌توانید از آن در:

- **Mangle**
- **Routing Mark**
- **Policy Routing**
- **VPN Routing**

استفاده کنید.

**مثال Mangle:**

```bash
/ip firewall mangle add \
    chain=prerouting \
    dst-address-list=social \
    action=mark-routing \
    new-routing-mark=via-vpn \
    passthrough=no
```

---

## ➕ افزودن سرویس جدید

1. **ASN سرویس** را پیدا کنید.
2. به **`update.js`** اضافه کنید:
   ```javascript
   netflix: {
       asn: 2906
   }
   ```
3. اجرا کنید:
   ```bash
   npm run update
   ```
4. تغییرات را **Push** کنید:
   ```bash
   git add .
   git commit -m "Add Netflix service"
   git push
   ```

> ✅ GitHub Actions بقیه مراحل را به‌صورت خودکار انجام می‌دهد.

---

## ⚠️ نکات تولید (Production)

| نکته | توضیحات |
|------|----------|
| **زمان‌بندی** | بهتر است زمان اجرای GitHub و Scheduler MikroTik با هم تداخل نداشته باشند. |
| **امنیت** | قبل از حذف Address List قدیمی، صحت فایل جدید بررسی شود. |
| **سرویس‌های بزرگ** | ممکن است نیاز به چندین ASN داشته باشند (مثلاً Google دارای ASNهای متعدد است). |
| **IPv6** | این نسخه فقط **IPv4** را پشتیبانی می‌کند. |
| **CDN** | استفاده از CDN ممکن است ASN واقعی سرویس را مخفی کند. |

---

## 🖼 عکس‌های معماری

### نمودار جریان داده

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Services  │────▶│  update.js   │────▶│  social.json│
│  (ASN List) │     │   (Parser)   │     │  (IP List)  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │   GitHub        │
                                         │   Repository    │
                                         └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │  Cloudflare     │
                                         │  Worker API     │
                                         └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │   MikroTik      │
                                         │   Address List  │
                                         └─────────────────┘
```

### جریان بروزرسانی

```
هر ۶ ساعت:
   GitHub Actions ──▶ Update Prefixes ──▶ Commit social.json
   
هر ۶ ساعت:
   MikroTik Scheduler ──▶ Fetch Worker API ──▶ Update Address List
```

---

## 📄 مجوز

این پروژه تحت مجوز **MIT** منتشر شده است. برای اطلاعات بیشتر فایل [LICENSE](LICENSE) را مشاهده کنید.

---

## 🤝 مشارکت

برای مشارکت در توسعه پروژه:

1. **Fork** کنید
2. **Branch** جدید بسازید (`git checkout -b feature/amazing-feature`)
3. **Commit** کنید (`git commit -m 'Add some amazing feature'`)
4. **Push** کنید (`git push origin feature/amazing-feature`)
5. **Pull Request** باز کنید

---

