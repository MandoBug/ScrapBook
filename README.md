# 📸 ScrapBook

> A personal, full-stack digital scrapbook built from scratch — created for someone I love, and as a way to grow as a developer.

---

## 💡 Why I Built This

I wanted to build something meaningful — not just another demo app. This scrapbook was created as a gift for my girlfriend: a place she can visit anytime, from anywhere, to look back on our memories together.

At the same time, I wanted to challenge myself technically by building a real, end-to-end application: frontend, backend, media storage, and deployment. This project represents both personal intention and professional growth.

---

## 🛠️ Tech Stack

This project uses modern tools and patterns commonly found in production applications.

### Frontend
- **React** + **Vite** for fast, modern UI development
- **TypeScript** for type safety and maintainability
- **Tailwind CSS** for responsive, utility-first styling
- **Framer Motion** for subtle animations and interactions

### Backend
- **Node.js + Express** for API routing and server logic
- **REST API** to manage scrapbook memories and metadata
- **Environment-based configuration** for security

### Media Storage
- **Amazon S3** for storing images and videos
- Media is served via URLs instead of bundling assets into the app

### Deployment
- **Frontend**: Vercel (continuous deployment)
- **Backend**: Render / Railway
- **Storage**: Amazon S3

---

## ☁️ Media Storage & Caching (Amazon S3)

To efficiently handle images and videos, all media assets are stored separately from the application using **Amazon S3**.

### Why S3?
- Prevents large files from bloating the repository or frontend bundle
- Allows reliable, scalable storage of images and videos
- Enables direct browser access to media without routing through the server

### How It Works
- Media files are uploaded to S3
- The backend stores and returns **URLs** to these assets
- The frontend loads images/videos directly from S3

### Caching & Performance
- S3 objects are served with **HTTP cache headers**
- Browsers cache media locally to reduce repeat downloads
- Revisiting the scrapbook loads significantly faster
- Media is decoupled from app deployments — redeploying the app does not invalidate cached assets

### Security
- AWS credentials are stored in environment variables
- `.env` files are excluded from version control
- GitHub push protection prevents accidental secret leaks

This setup mirrors how production applications handle static media at scale.

---

## ✨ Features

- Clean, responsive UI (mobile-friendly)
- Star-field animated background with subtle visual details
- Memory cards with photos, videos, dates, and descriptions
- Timeline and grid views for browsing memories
- Search functionality across memories
- Admin panel for adding and editing memories
- Easter-egg interaction revealing a handwritten love letter

---

## 📖 Learning in Public

This project was built intentionally as a learning experience. I researched documentation, debugged issues, refactored code, and iterated on design decisions throughout the process.

If you’re reviewing this as part of a job application — this repository represents my learning process in motion.

---

## 💚 Special Thanks

To my girlfriend — thank you for believing in me, supporting me, and inspiring this project. You make my life better every single day.

