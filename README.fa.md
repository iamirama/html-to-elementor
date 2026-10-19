<div align="center" dir="rtl">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=200&section=header&text=HTML%20%E2%86%90%20Elementor&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38" width="100%"/>

### 🎨 هر HTML رو در یک لحظه به قالب زیبای المنتور تبدیل کن.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](./LICENSE)

[![Stars](https://img.shields.io/github/stars/iamirama/html-to-elementor?style=for-the-badge&logo=github&color=FFD700)](https://github.com/iamirama/html-to-elementor/stargazers)
[![Forks](https://img.shields.io/github/forks/iamirama/html-to-elementor?style=for-the-badge&logo=github&color=60a5fa)](https://github.com/iamirama/html-to-elementor/network)
[![Issues](https://img.shields.io/github/issues/iamirama/html-to-elementor?style=for-the-badge&logo=github&color=f87171)](https://github.com/iamirama/html-to-elementor/issues)
[![Last Commit](https://img.shields.io/github/last-commit/iamirama/html-to-elementor?style=for-the-badge&logo=git&color=a78bfa)](https://github.com/iamirama/html-to-elementor/commits/main)

<br/>

[🚀 شروع سریع](#-شروع-سریع) · [✨ امکانات](#-امکانات) · [📖 API](#-api) · [🧩 ساختار پروژه](#-ساختار-پروژه) · [🤝 مشارکت](#-مشارکت)

<br/>

🌍 **Languages**: [English](./README.md) · **فارسی** ✅

</div>

---

<div dir="rtl">

## 📌 این پروژه چیست؟

**HTML → Elementor** یک سرویس سبک و سریع بر پایه **Node.js** است که HTML خام رو می‌گیره و به یک **قالب JSON معتبر المنتور** تبدیل می‌کنه که می‌تونی مستقیم توی وردپرس ایمپورتش کنی.

دیگه لازم نیست هر بخش رو دستی توی المنتور بازسازی کنی — کافیه HTML رو پیست کنی و یک قالب آماده تحویل بگیری.

این پروژه مخصوص توسعه‌دهنده‌ها و طراحانی ساخته شده که می‌خوان صفحات HTML استاتیک رو بدون بازنویسی هر سکشن، به المنتور منتقل کنن.

---

## ✨ امکانات

| | ویژگی | توضیح |
|---|---|---|
| 🔄 | **تبدیل HTML به المنتور** | تبدیل HTML خام به JSON بومی المنتور |
| ✅ | **اعتبارسنجی اسکیما** | بررسی صحت قالب قبل از خروجی بر اساس اسکیمای المنتور |
| 🎯 | **ایمپورت یک‌کلیکی** | خروجی رو مستقیم توی المنتور پیست کن |
| 🖥️ | **رابط وب داخلی** | رابط کاربری آماده — نیازی به CLI نیست |
| ⚡ | **سریع و سبک** | Express + Cheerio، وابستگی‌های حداقلی |
| 🧩 | **ماژولار** | جداسازی تمیز مبدل و اعتبارسنج |

---

## 🛠 تکنولوژی‌ها

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Cheerio](https://img.shields.io/badge/Cheerio-E88D3A?style=flat-square&logo=jquery&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

</div>

---

## ⚡ شروع سریع

### 1️⃣ پیش‌نیازها

- **Node.js** `>= 18`
- **npm** `>= 9`

### 2️⃣ کلون و نصب

```
git clone https://github.com/iamirama/html-to-elementor.git
cd html-to-elementor
npm install
```

### 3️⃣ اجرای سرور

```
npm start
```

سپس باز کن 👈 **http://localhost:3000**

---

## 🚀 استفاده

### 🖥️ رابط وب

1. آدرس `http://localhost:3000` رو توی مرورگر باز کن
2. HTML خودت رو توی ادیتور پیست کن
3. روی **Convert** کلیک کن
4. فایل `.json` المنتور رو دانلود کن
5. توی وردپرس: **Templates → Import Template** → فایل رو آپلود کن ✅

### 📡 API

یک درخواست `POST` با HTML خودت بفرست:

```
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<section><h1>سلام دنیا</h1></section>"
  }'
```

**پاسخ:**

```
{
  "success": true,
  "template": {
    "version": "0.4",
    "title": "Converted Template",
    "type": "section",
    "content": []
  }
}
```

---

## 📖 API

| متد | مسیر | توضیح |
|:------:|----------|-------------|
| `GET`  | `/`              | رابط وب |
| `POST` | `/api/convert`   | تبدیل HTML به JSON المنتور |
| `POST` | `/api/validate`  | اعتبارسنجی یک قالب المنتور |

---

## 🧩 ساختار پروژه

```
html-to-elementor/
├── 📄 server.js                  # سرور Express و مسیرهای API
├── 📁 lib/
│   ├── 🎨 elementorConverter.js  # منطق تبدیل HTML به المنتور
│   └── ✅ validateTemplate.js    # اعتبارسنج اسکیمای قالب
├── 📁 public/
│   └── 🌐 index.html             # رابط وب
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 .gitignore
├── 📄 README.md                  # نسخه انگلیسی
└── 📄 README.fa.md               # نسخه فارسی (همین فایل)
```

---

## 🎨 نحوه کار

```
flowchart RL
    A[📝 HTML خام] --> B[🔍 پارس با Cheerio]
    B --> C[🧠 ساختار المنتور]
    C --> D[✅ اعتبارسنجی اسکیما]
    D --> E[📦 خروجی JSON]
    E --> F[🎯 ایمپورت در المنتور]
```

---

## 🤝 مشارکت

از مشارکت شما استقبال می‌کنیم! مراحل:

1. 🍴 **Fork** کن
2. 🌿 یک branch بساز: `git checkout -b feature/amazing-feature`
3. 💾 تغییرات رو کامیت کن: `git commit -m "Add amazing feature"`
4. 📤 پوش کن: `git push origin feature/amazing-feature`
5. 🎉 یک **Pull Request** باز کن

---

## 📄 لایسنس

تحت **مجوز MIT** منتشر شده. برای اطلاعات بیشتر [`LICENSE`](./LICENSE) رو ببین.

---

<div align="center">

### ⭐ اگه این پروژه به کارت اومد، یه ستاره بده!

[![Star](https://img.shields.io/badge/⭐_ستاره_بده_به_این_ریپو-FFD700?style=for-the-badge&logo=github&logoColor=black)](https://github.com/iamirama/html-to-elementor)

<sub>ساخته شده با ❤️ توسط <a href="https://github.com/amirhoseini">Amirhoseini</a></sub>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=120&section=footer" width="100%"/>

</div>

</div>
