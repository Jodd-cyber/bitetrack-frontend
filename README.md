# BiteTrack Frontend

BiteTrack Frontend is the client-side application for BiteTrack, a food expense and diet tracking app. It provides the user interface for authentication, food order logging, budget tracking, receipt scanning, Gmail order syncing, AI chat assistance, and spending reports.

## Features

- Landing page for BiteTrack
- User signup and signin
- Google and GitHub OAuth login flow
- Forgot password and reset password pages
- Protected ledger dashboard
- Add, edit, delete, search, filter, and sort food logs
- Monthly budget tracking
- Spending summaries and daily spending chart
- Receipt scanning through backend AI API
- Gmail sync for Swiggy/Zomato orders
- AI assistant chat with saved chat sessions
- PDF report export for monthly and all-time orders
- Light/dark theme support
- Informational pages: About, Features, Contact, Privacy, Terms

## Tech Stack

- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Recharts
- jsPDF
- jsPDF AutoTable
- jwt-decode
- ESLint

## Project Structure

```txt
frontend/
├── public/
│   ├── demo.mp4
│   ├── favicon.svg
│   ├── icons.svg
│   └── _redirects
├── src/
│   ├── assets/
│   │   └── hero.png
│   ├── components/
│   │   ├── AIAssistant.jsx
│   │   ├── Loader.jsx
│   │   ├── ProfileModal.jsx
│   │   ├── SleekDatePicker.jsx
│   │   ├── SleekSelect.jsx
│   │   ├── SleekTimePicker.jsx
│   │   └── VantaBackground.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Features.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Home.jsx
│   │   ├── Ledger.jsx
│   │   ├── OAuthSuccess.jsx
│   │   ├── Privacy.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── SignIn.jsx
│   │   ├── SignUp.jsx
│   │   └── Terms.jsx
│   ├── utils/
│   │   ├── apiBase.js
│   │   ├── apiResponse.js
│   │   ├── authUtils.js
│   │   └── warmBackend.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── vercel.json
└── README.md
