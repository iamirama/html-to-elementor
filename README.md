<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=200&section=header&text=HTML%20%E2%86%92%20Elementor&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38" width="100%"/>

### 🎨 Convert any HTML into beautiful Elementor templates — instantly.

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

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [📖 API](#-api) · [🧩 Structure](#-project-structure) · [🤝 Contributing](#-contributing)

<br/>

🌍 **Languages**: **English** ✅ · [فارسی](./README.fa.md)
<a href="https://html-to-elementor-rho.vercel.app/" target="_blank">
  <img src="https://img.shields.io/badge/🚀_Live_Demo-Try_THIS_App-4F46E5?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" height="45" />
</a>


</div>

---

## 📌 What is this?

**HTML → Elementor** is a lightweight Node.js service that takes raw HTML and converts it into a valid **Elementor JSON template** you can import directly into WordPress. No more rebuilding layouts by hand — paste your HTML, get a ready-to-use template.

Built for developers and designers who want to migrate static HTML pages into Elementor without rewriting every section.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🔄 | **HTML → Elementor** | Converts raw HTML into native Elementor JSON |
| ✅ | **Schema Validation** | Validates templates against the Elementor schema before export |
| 🎯 | **One-Click Import** | Paste the output straight into Elementor |
| 🖥️ | **Web UI Included** | Built-in interface — no CLI required |
| ⚡ | **Fast & Lightweight** | Express + Cheerio, minimal dependencies |
| 🧩 | **Modular** | Clean separation of converter & validator |

---

## 🛠 Tech Stack

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Cheerio](https://img.shields.io/badge/Cheerio-E88D3A?style=flat-square&logo=jquery&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

</div>

---

## ⚡ Quick Start

### 1️⃣ Prerequisites

- **Node.js** `>= 18`
- **npm** `>= 9`

### 2️⃣ Clone & Install

```
git clone https://github.com/iamirama/html-to-elementor.git
cd html-to-elementor
npm install
```

### 3️⃣ Run the server

```
npm start
```

Then open 👉 **http://localhost:3000**

---

## 🚀 Usage

### 🖥️ Web Interface

1. Open `http://localhost:3000` in your browser
2. Paste your HTML into the editor
3. Click **Convert**
4. Download the generated Elementor `.json` file
5. In WordPress → **Templates → Import Template** → upload the file ✅

### 📡 API

Send a `POST` request with your HTML:

```
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<section><h1>Hello World</h1></section>"
  }'
```

**Response:**

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

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET`  | `/`              | Web UI |
| `POST` | `/api/convert`   | Convert HTML to Elementor JSON |
| `POST` | `/api/validate`  | Validate an Elementor template |

---

## 🧩 Project Structure

```
html-to-elementor/
├── 📄 server.js                  # Express server & API routes
├── 📁 lib/
│   ├── 🎨 elementorConverter.js  # HTML → Elementor logic
│   └── ✅ validateTemplate.js    # Template schema validator
├── 📁 public/
│   └── 🌐 index.html             # Web UI
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 .gitignore
├── 📄 README.md                  # English version (this file)
└── 📄 README.fa.md               # Persian version
```

---

## 🎨 How It Works

```
flowchart LR
    A[📝 Raw HTML] --> B[🔍 Parse with Cheerio]
    B --> C[🧠 Build Elementor Structure]
    C --> D[✅ Validate Schema]
    D --> E[📦 Export JSON Template]
    E --> F[🎯 Import into Elementor]
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. 🍴 **Fork** the repo
2. 🌿 Create a branch: `git checkout -b feature/amazing-feature`
3. 💾 Commit your changes: `git commit -m "Add amazing feature"`
4. 📤 Push: `git push origin feature/amazing-feature`
5. 🎉 Open a **Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">

### ⭐ If this project helped you, please give it a star!

[![Star](https://img.shields.io/badge/⭐_Star_this_repo-FFD700?style=for-the-badge&logo=github&logoColor=black)](https://github.com/iamirama/html-to-elementor)

<sub>Made with ❤️ by <a href="https://github.com/amirhoseini">Amirhoseini</a></sub>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=120&section=footer" width="100%"/>

</div>
