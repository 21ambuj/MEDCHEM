# AasaMedChem Inventory & Order Management System

This is a Next.js full-stack application built for the AasaMedChem hackathon assignment.

## Tech Stack
*   **Frontend & Backend:** Next.js (App Router, React)
*   **Database:** Neon PostgreSQL
*   **ORM:** Prisma
*   **Styling:** Tailwind CSS
*   **Deployment:** Vercel

## High-Level System Design
The application uses the Next.js App Router for both UI and API capabilities.
*   **Frontend (`src/app`):** Contains the React components for the `admin`, `seller`, and `login` panels. Uses standard React hooks (`useState`, `useEffect`) and communicates with the backend via fetch requests.
*   **Backend (`src/app/api`):** Next.js Route Handlers act as the backend API. They securely connect to the Neon database using the Prisma ORM.
*   **Database (`Neon PostgreSQL`):** Stores Users, Products, Orders, and OrderItems.

## Unit Conversion & Storage Strategy
To prevent floating-point and rounding errors, all data is normalized to a **Base Unit** before being stored in the database.

*   **Weight:** Base unit = `g`
*   **Volume:** Base unit = `ml`
*   **Count:** Base unit = `item`

**How it works:**
1.  **Storage:** Prices are stored as `INR per Base Unit` (e.g., INR per gram) using the high-precision `Decimal` type in PostgreSQL. Inventory quantities are also stored in the base unit.
2.  **Display:** When a user views products, they see the price per base unit (or can calculate the price for kg/L dynamically on the frontend).
3.  **Calculations (The Code):** When a user places an order for "2 kg", the frontend converts this to "2000 g" (`quantity * conversionFactor`). It multiplies `2000` by the `base_price_inr` to get the exact final price. The database stores the original requested unit (`kg`), the requested quantity (`2`), and the converted base quantity (`2000`) for perfect auditing.

## Database Schema (Prisma)
The database uses `Decimal` types for high-precision numeric fields.
*   `User`: id, email, password, role (ADMIN | SELLER)
*   `Product`: id, name, base_unit, base_price_inr, inventory_quantity
*   `Order`: id, userId, status, total_price_inr
*   `OrderItem`: id, orderId, productId, ordered_quantity, ordered_unit, base_quantity, price_inr

## Setup Instructions

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project and add your Neon Database connection string:
    ```
    DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
    ```

3.  **Push Database Schema:**
    ```bash
    npx prisma db push
    ```

4.  **Run Locally:**
    ```bash
    npm run dev
    ```
    Navigate to `http://localhost:3000/login`

## How to Deploy to Vercel
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** section and add:
   * `DATABASE_URL`: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`
5. Click **Deploy**. Vercel will automatically run `npm run build` and `prisma generate`.

## How to Test
1.  Go to `/login`.
2.  Enter any email containing the word "admin" (e.g., `admin@test.com`) to log in to the Admin Dashboard.
3.  Add a product (e.g., "Rice", unit: "g", base price: 0.05).
4.  Log out, and log in with a seller email (e.g., `seller@test.com`).
5.  Order the product in kilograms. Verify the price calculates perfectly.
6.  Log back into the Admin dashboard to view the order and see the inventory decrement.
