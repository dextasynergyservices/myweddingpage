# myweddingpage

An AI-powered platform for creating beautiful, personalized wedding pages for couples. Built with Next.js 15 (App Router) and deployed on Vercel/AWS.

---

## ✨ Features

✅ Public marketing site with pricing and live samples  
✅ User sign-up, payment, subscription management  
✅ Choose from pre-built templates  
✅ AI-powered onboarding wizard to customize wedding pages  
✅ Photo and video uploads (Cloudinary)  
✅ User dashboard to manage page, comments, renewals  
✅ Admin dashboard with drag-and-drop builder for pages  
✅ Tiered subscription plans with different limits  
✅ Stripe and Paystack payment integration  
✅ Email reminders for renewals (SendGrid/Resend)

---

## 🗺️ Project Structure

/src
/app
/public - Public site (landing, pricing, samples)
/dashboard
/user - User dashboard (plans, uploads, comments)
/admin - Admin dashboard (users, pages, builder)
/api - Next.js API routes
/components - Reusable React components
/lib - Database, auth, payment, AI utilities
/prisma - Prisma schema and migrations
/styles - Tailwind CSS
/utils - Helpers and validations
/public - Static assets

---

## ⚡️ Tech Stack

- **Frontend/Backend:** Next.js 15 (App Router), React
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
- **Database:** PostgreSQL + Prisma
- **File Storage:** Cloudinary
- **Payments:** Stripe, Paystack
- **AI Integration:** OpenAI API
- **Emails:** SendGrid / Resend
- **Deployment:** Vercel (for staging), AWS (for production-ready)

---

## 🚀 Getting Started Locally

### 1️⃣ Clone the repo

```bash
git clone https://github.com/dextasynergyservices/myweddingpage.git
cd myweddingpage
```

### Install Dependencies

```bash
pnpm install
```

### Setup Environment variables

```bash
cp .env.example .env
```

- Change credentials

### Prisma Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### Run Locally

```bash
pnpm dev
```

## 🗄️ Database Setup & Prisma ORM

This project uses **PostgreSQL** hosted on [Neon](https://neon.tech) and managed with **Prisma ORM**. Below are instructions for setting up, seeding, and verifying your database.

---

### 🔧 Requirements

- [Neon Account](https://neon.tech)
- `.env` file configured with your Neon PostgreSQL connection string:

```env
DATABASE_URL=postgresql://<user>:<password>@<your-project>.neon.tech/<db-name>?sslmode=require
```

### Useful Commands

```bash
pnpm lint         # Lint code
pnpm format       # Prettier formatting
pnpm typecheck    # TypeScript checks
pnpm build        # Build production
pnpm start        # Start production server

# Prisma
pnpm prisma:migrate   # Run migration
pnpm prisma:generate  # Generate client
pnpm prisma:studio    # Open Prisma Studio
```
