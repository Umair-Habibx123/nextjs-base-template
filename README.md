# 🚀 Next.js Base Template

A modern **full-stack Next.js starter** featuring a clean architecture, reusable components, and a fully functional admin dashboard — perfect for building scalable web applications, SaaS platforms, and multi-language websites.

---

## ✨ Features

- ⚡ **Next.js 14+ App Router** (optimized for performance)
- 🗂️ **Modular Project Structure** under `/src`
- 💾 **SQLite Database** for lightweight development
- 🔐 **Authentication Context** (extendable)
- 🧠 **Admin Dashboard** with theme & language settings
- 🌍 **i18n Internationalization** ready
- 📬 **API Routes** for contact forms, newsletters, themes, etc.
- 🎨 **Rich UI Components** and layout system
- 🧱 **Reusable Template Design** for new project bases

---

## 🧭 Folder Structure Overview

```bash
src/
  app/
    (user)/...         # Public pages (home, about, contact, etc.)
    admin-dashboard/   # Admin pages and components
    api/               # API routes for backend logic
    components/        # Shared UI components
    context/           # React contexts (auth, theme, analytics)
    database/          # SQLite setup and DB connection
    providers/         # Context and theme providers
    utils/             # Helper utilities
````

---

## ⚙️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Umair-Habibx123/nextjs-base-template.git
cd nextjs-base-template
```

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the project root:

```bash
DATABASE_URL="file:./your_database.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4️⃣ Run the Development Server

```bash
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)**

---

## 🗄️ Database

* Uses **SQLite** for fast local development
* `.db` files are **ignored** in `.gitignore`
* Easily replaceable with PostgreSQL, MySQL, or others later

---

## 🧩 Customization

You can reuse or extend:

* **Components** → `src/app/components`
* **Layouts** → `src/app/components/layout`
* **Admin Modules** → `src/app/admin-dashboard`
* **APIs** → `src/app/api`

---

## 🛠️ Scripts

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start the local development server |
| `npm run build` | Build the app for production       |
| `npm run start` | Run the production server          |
| `npm run lint`  | Lint your code                     |

---

## 📦 Tech Stack

* **Framework:** Next.js 14+
* **Language:** JavaScript (ESNext) / JSX
* **Database:** SQLite
* **Styling:** Tailwind CSS
* **State Management:** React Context API
* **Deployment:** Vercel (default)

---

## 🧑‍💻 Author

**Umair Habib**
💼 Full Stack Developer
🐙 [GitHub Profile](https://github.com/Umair-Habibx123)



<!-- # 🚀 Next.js Base Template

A modern **full-stack Next.js starter** featuring a clean architecture, reusable components, and a fully functional admin dashboard — perfect for building scalable web applications, SaaS platforms, and multi-language websites.

---

## ✨ Features

- ⚡ **Next.js 14+ App Router** (optimized for performance)
- 🗂️ **Modular Project Structure** under `/src`
- 💾 **SQLite Database** for lightweight development
- 🔐 **Authentication Context** (extendable)
- 🧠 **Admin Dashboard** with theme & language settings
- 🌍 **i18n Internationalization** ready
- 📬 **API Routes** for contact forms, newsletters, themes, etc.
- 🎨 **Rich UI Components** and layout system
- 🧱 **Reusable Template Design** for new project bases

---

## 🧭 Folder Structure Overview

```bash
src/
  app/
    (user)/...         # Public pages (home, about, contact, etc.)
    admin-dashboard/   # Admin pages and components
    api/               # API routes for backend logic
    components/        # Shared UI components
    context/           # React contexts (auth, theme, analytics)
    database/          # SQLite setup and DB connection
    providers/         # Context and theme providers
    utils/             # Helper utilities
````

---

## ⚙️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/GalvanAI/nextjs-base-template
cd nextjs-base-template
```

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the project root:

```bash
DATABASE_URL="file:./your_database.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4️⃣ Run the Development Server

```bash
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)**

---

## 🗄️ Database

* Uses **SQLite** for fast local development
* `.db` files are **ignored** in `.gitignore`
* Easily replaceable with PostgreSQL, MySQL, or others later

---

## 🧩 Customization

You can reuse or extend:

* **Components** → `src/app/components`
* **Layouts** → `src/app/components/layout`
* **Admin Modules** → `src/app/admin-dashboard`
* **APIs** → `src/app/api`

---

## 🛠️ Scripts

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start the local development server |
| `npm run build` | Build the app for production       |
| `npm run start` | Run the production server          |
| `npm run lint`  | Lint your code                     |

---

## 📦 Tech Stack

* **Framework:** Next.js 14+
* **Language:** JavaScript (ESNext) / JSX
* **Database:** SQLite
* **Styling:** Tailwind CSS
* **State Management:** React Context API

---

## 🧑‍💻 Author

**GalvanAI**
💼 Full Stack Developer
🐙 [GitHub Profile](https://github.com/GalvanAI)


````` -->