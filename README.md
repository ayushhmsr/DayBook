# 📓 DayBook — The Craft Daily Journal for Every Trade & Craft

<p align="center">
  <strong>A high-performance, animation-rich, profession-tailored journaling application built for traders, software developers, logistics drivers, and everyday life.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Vite" />
  <img src="https://img.shields.io/badge/Animations-GSAP%203-88CE02?style=for-the-badge&logo=greensock&logoColor=black" alt="GSAP" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node Express" />
  <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Internationalization-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-orange?style=for-the-badge" alt="i18n" />
</p>

---

## ✨ Highlights & Features

### 🛠️ 1. Profession-Tailored Templates
DayBook moves beyond generic note-taking with structured, domain-specific entry schemas:
* **📈 Trader Logbook**: Track market instruments, trade directions (Long/Short), entry/exit prices, net PnL, setup strategy (Breakout, Mean Reversion, Scalp), and emotional discipline score ($1-10$).
* **💻 Developer Journal**: Record focus hours, primary languages/frameworks, work category (Feature, Bugfix, Refactor, DevOps), blockers, and GitHub links/PRs.
* **🚚 Driver Trip Log**: Log starting/ending odometer readings, fuel consumption, route details, and rest stops (*personal logbook*).
* **🌿 Everyday Life**: Capture gratitude, daily highlights, lessons learned, and mood ratings.

---

### 🎙️ 2. Smart Voice-to-Text Dictation (Mobile & Desktop)
* Powered by the **Web Speech API** with native support for both **English (`en-US`)** and **Hindi (`hi-IN`)**.
* **Mobile Engine Adaptive**: Implements atomic non-continuous recognition on Android/iOS to eliminate mobile browser transcript repetition quirks, while retaining fluid continuous streaming on desktop laptops.

---

### 📊 3. Zero-Dependency SVG Visual Analytics & Performance Curves
* Responsive, custom-calculated vector charts:
  * **Trader**: Cumulative PnL equity curve, Win Rate breakdown per setup, and discipline correlation matrix.
  * **Developer**: Daily coding hours velocity and task distribution pie/bars.
  * **Driver**: Distance vs fuel efficiency trends.
  * **Everyday**: Mood timeline tracking and daily word count velocity.
* **Timeframe Filters**: Analyze metrics over `7D`, `30D`, `90D`, and `All Time`.

---

### 🔥 4. Real-Time Streak Guard & Automated Inactive-User Reminders
* **Live Countdown Banner**: Dynamic countdown timer ticking down to local midnight, reminding users to protect their daily streak before it resets.
* **1-Click Rapid Entry**: Jump straight from the banner to today's logbook.
* **Automated Evening Reminders**: Dispatches formatted HTML reminder emails to users who haven't logged their entry before the midnight deadline.

---

### 🎴 5. Strict 7-Day Consistency Loyalty Card & Export
* **Consistency Verification**: Generates an exclusive digital Member Loyalty Card showing total logged entries, consecutive streak count, and join date.
* **Milestone Lock**: Download and share options are strictly locked until the member reaches $\ge 7$ consecutive days of authentic journaling.
* **High-Res Card Export**: Exports styled, high-DPI cards with customized identity badges via `html2canvas`.

---

### 🎬 6. Cinematic GSAP Motion & Tactile Interactions
* **Scroll-Driven Storytelling**: Masked text reveals, ruled notebook lines drawing in real time, and 3D magnetic physics buttons (`quickTo`).
* **Interactive Heatmaps**: GitHub-style activity heatmaps with animated ripple sweeps on scroll (`Flip` and `ScrollTrigger`).
* **Micro-Interactions**: Rubberband card tilts, "Logged" stamp slam animations, and seamless page transition sweeps.
* **Full Accessibility**: Built-in support for `prefers-reduced-motion`.

---

### 🌐 7. Complete Bilingual Localization (i18n)
* Instant, persistent language toggling between **English** and **हिन्दी (Hindi)** covering every button, label, chart, error message, and email.

---

### 🔒 8. Enterprise-Grade Authentication & User Isolation
* Secure **JWT Access & Refresh Token** rotation with `HttpOnly`, `SameSite` cookies.
* Email OTP verification with welcome/membership blessing emails.
* Pure user isolation: all entries are encrypted and indexed strictly per authenticated MongoDB user ID.

---

## 🏗️ Architecture & Project Structure

```
daybook/
├── backend/                  # Express REST API & Database layer
│   ├── src/
│   │   ├── config/           # Database & JWT configurations
│   │   ├── controllers/      # Auth, Entry, and Reminder controllers
│   │   ├── models/           # Mongoose schemas (User, Entry, Session, OTP)
│   │   ├── routes/           # REST endpoints (/api/auth, /api/entries)
│   │   └── utils/            # Email templates (Welcome, Reminders, OTP)
│   ├── .env.example          # Backend environment configuration template
│   ├── package.json
│   └── server.js             # Express app entry point
│
├── frontend/                 # React 18 + Vite SPA
│   ├── src/
│   │   ├── api/              # Scoped client API layer (journalApi.js)
│   │   ├── components/       # UI components (FieldRenderer, Analytics, StreakGuard, LoyaltyCard)
│   │   ├── data/             # Profession template configurations (templates.js)
│   │   ├── i18n/             # Language context & translation dictionaries
│   │   ├── lib/              # GSAP plugins & motion helpers
│   │   ├── pages/            # Landing, Auth, Dashboard, Entries, NewEntry
│   │   ├── styles/           # Styling architecture (landing.css, app.css, global.css)
│   │   └── utils/            # Image processing, date helpers, card exporters
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0+ or higher
* **MongoDB**: A running MongoDB instance (Local or MongoDB Atlas)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the `backend/` directory (or copy from `.env.example`):

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_oauth_refresh_token
GOOGLE_USER=your_email@gmail.com
```

Start the backend server:
```bash
npm run dev
# Running on http://localhost:3000
```

---

### 2. Frontend Setup

```bash
cd ../frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
# Running on http://localhost:5173
```

To create a production build:
```bash
npm run build
```

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user and dispatch OTP |
| `POST` | `/api/auth/verify-email` | Verify OTP, activate account, and send Welcome email |
| `POST` | `/api/auth/login` | Authenticate user credentials and issue tokens |
| `POST` | `/api/auth/refresh-token` | Rotate JWT session tokens |
| `POST` | `/api/auth/logout` | Revoke session and clear cookies |
| `POST` | `/api/auth/send-reminders`| Dispatch daily streak reminder emails |

### 📝 Entries (`/api/entries`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/entries` | List authenticated user's entries (filterable by template & date) |
| `POST` | `/api/entries` | Create a new structured journal entry |
| `DELETE`| `/api/entries/:id` | Delete an entry by ID |

---

## 👨‍💻 Author & Acknowledgements

Created with passion by **[Ayush Kumar Mishra](https://github.com/ayushhmsr)**.

* **Fonts**: Bricolage Grotesque & Instrument Sans via Google Fonts.
* **Motion Design**: GSAP 3 (ScrollTrigger, Flip, Observer).

---

<p align="center">
  <sub>DayBook © 2026 — Craft your discipline, one day at a time.</sub>
</p>
