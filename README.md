# 📱 Dompetin - Smart Personal Finance App with AI Assistant

<img width="1536" height="1024" alt="Mockup - Dompetin App" src="https://github.com/user-attachments/assets/7cd769b1-5bba-4b49-b76a-be257d45fe5f" />

[![React](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite)](https://vite.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/explore/progressive-web-apps)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-solid?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

**Dompetin** is a modern, mobile-first personal finance tracker built to go beyond conventional expense logging. By integrating **Google Gemini 2.5 Flash**, the app acts as a smart financial assistant, providing dynamic, Gen-Z styled financial insights and "roasts" based on user spending habits. 

Engineered as a **Progressive Web App (PWA)**, Dompetin offers a native-app-like experience, allowing users to install it directly to their mobile home screens for seamless, on-the-go access.

---

## ✨ Key Features & Selling Points

- **Progressive Web App (PWA):** Fully installable on mobile devices (iOS/Android) with offline-ready capabilities, delivering a native app feel without the app store hassle.
- **AI-Powered Financial Insights:** Integrated with the cutting-edge **Google Gemini 2.5 Flash API**. Users can request on-demand financial analysis and witty expense "roasts" tailored to their current transaction data.
- **Serverless Architecture via Supabase:** Leverages BaaS for robust PostgreSQL database management, secure user authentication (OAuth/Email), and Row Level Security (RLS) to ensure strict data privacy.
- **Global Privacy Toggle (Hide Balance):** A privacy feature utilizing React Context API to mask the user's primary balance across all screens with a single click.
- **Real-time User Feedback System:** A built-in reporting modal that directly feeds bug reports and user feedback into the Supabase database.
- **Premium Mobile-First UI/UX:** Features a sleek Dark Mode design, an interactive Donut Chart for expense distribution, and intuitive bottom navigation for optimal mobile usability.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite)
- **Styling:** Tailwind CSS (Modern Utility-First UI)
- **Backend & Database:** Supabase (PostgreSQL, Auth, RLS)
- **Artificial Intelligence:** `@google/generative-ai` SDK
- **State Management:** React Context API

---

## 📱 Mobile Installation Guide (PWA)

Since Dompetin is built as a Progressive Web App, it does not require an App Store or Play Store download. It can be installed directly from the browser on any mobile device.

### For iOS (Safari)
1. Open the live deployment link in **Safari**.
2. Tap the **Share** button (the square icon with an arrow pointing up) at the bottom of the screen.
3. Scroll down the share sheet and tap **Add to Home Screen**.
4. Tap **Add** in the top-right corner to confirm. The app icon will now appear on your home screen.

### For Android (Google Chrome)
1. Open the live deployment link in **Google Chrome**.
2. Tap the **Three-dot menu icon** in the top-right corner next to the address bar.
3. Tap **Install app** (or **Add to Home screen**).
4. Follow the on-screen prompts to complete the installation.

---

## 🚀 Getting Started (Local Development)

Follow these instructions to set up the project locally.

## 1. Clone the Repository

```bash
git clone https://github.com/mmarseal/dompetin.git
cd dompetin
```

---

## 2. Install Dependencies

> We use `--legacy-peer-deps` to safely bypass peer dependency conflicts between Vite 8.x and the current PWA plugin version.

```bash
npm install --legacy-peer-deps
```

---

## 3. Environment Variables Setup (`.env`)

Create a `.env` file in the root directory and add the following credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## 4. Run the Development Server

```bash
npm run dev
```

The application will be available at:

```txt
http://localhost:5173
```
