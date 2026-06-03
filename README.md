# AasaMedChem - B2B Chemical Inventory & Ordering System

A full-stack, production-ready web application built for B2B chemical inventory management and e-commerce distribution. 

## 🚀 Core Features

- **Role-Based Access Control (RBAC):** Strictly isolated routing and dashboards for `ADMIN` and `SELLER` roles using session-based authentication.
- **Dynamic Unit Conversion Engine:** A mathematical frontend engine that completely decouples the database's Base Storage Unit (e.g., Grams) from the frontend Display Unit (e.g., Kilograms). This allows Administrators to list products in bulk, while Sellers purchase in micro-quantities, with dynamic price scaling.
- **ACID-Compliant Database Transactions:** The checkout process is secured using Prisma ORM `$transaction` logic. Creating invoices and decrementing inventory occurs atomically, preventing database corruption if a network failure occurs halfway through an order.
- **High-Precision Datatypes:** Utilized `Decimal` types in the PostgreSQL database schema rather than standard `Float` types. This entirely bypasses JavaScript floating-point math errors, guaranteeing 100% precision for micro-chemical measurements (e.g., 0.001 g) and financial accuracy.
- **Complete CRUD REST API:** Powered by Next.js Serverless Route Handlers, providing instantaneous, concurrent data fetching (`Promise.all()`) for inventory and order history.

## 💻 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js Serverless API Routes
- **Database:** Neon (Serverless PostgreSQL)
- **ORM:** Prisma
- **Language:** TypeScript / JavaScript

## ⚙️ Local Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with your PostgreSQL `DATABASE_URL`
4. Run Prisma database migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000` in your browser.
