# Dastaan Heritage Kitchen — Premium Food Order Management System

A commercial-grade, full-stack food ordering and operations management platform designed for luxury Indian artisanal fine dining. Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Node.js/Express**, **Prisma ORM**, and **PostgreSQL**.

---

## 1. System Architecture & Dual Experience

The application is architected into two interconnected, production-ready interfaces:

### A. Customer-Facing Ordering Experience
- **Editorial Brand Presentation**: Refined visual identity inspired by high-end gastronomy publications, Michelin standards, and Awadhi royal craftsmanship.
- **Dynamic Menu Discovery**: Category tabs, instant search, Veg/Non-Veg dietary toggle (authentic Indian culinary symbols), spice intensity scales (Mild to Angaari Hot), prep times, and caloric/allergen notices.
- **Dish Detail & Add-on Customizer**: Interactive modal allowing patrons to select accompaniments (e.g., *Burani Garlic Raita*, *Ulte Tawe Paratha*, *Makkhan Float*) with dynamic price recalculation.
- **Persistent Cart & Promotion Engine**: Transparent cost calculation including Subtotal, 5% GST (2.5% CGST + 2.5% SGST), packaging/delivery fee rules (free above ₹999), and coupon redemption (`ROYAL10`, `FIRSTBITE`, `FEAST20`).
- **Checkout & Simulated Gateway**: Support for Cash on Delivery / Pay at Counter and safe simulated UPI / Card transactions with verifiable confirmation references (`PAY_SIM_XXXXXXXX`).
- **Live Order Tracker**: Real-time tracking with status progress timeline, valet/kitchen audit log, estimated delivery countdown, printable invoice receipt, and state-validated cancellation capability.

### B. Restaurant Administration Dashboard (`/admin`)
- **Operations Overview**: Real-time KPI counters (Orders Today, Needs Review, Cooking in Handi, Out for Delivery, Completed Today, Net Revenue, Average Order Value).
- **7-Day Revenue Trend Chart**: Built with Recharts, graphing confirmed daily income directly from PostgreSQL records.
- **Live Incoming Order Queue**: Immediate visibility of orders requiring kitchen confirmation.
- **Order Management Screen**: Comprehensive table with filters by status (`PLACED`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`), order type (`DELIVERY`, `PICKUP`, `DINE_IN`), search, and pagination.
- **Order Inspection Drawer**: Full item snapshot, add-ons breakdown, patron contact details, single-click status progression (`Confirm Order` → `Send to Kitchen` → `Dispatch` → `Complete`), and cancellation with reason logging.
- **Menu Management**: Full CRUD for dishes, price in INR, image preview, category selector, spice scale, and **instant live availability toggle switch** reflecting immediately across the customer menu.
- **Category Management**: Course management with item counts and relational deletion protection (prompts for reassignment if category has active dishes).
- **Patron CRM Directory**: Aggregated from real database orders, calculating total orders placed, completed count, and lifetime spend in INR (₹).
- **Financial Reports & CSV Export**: Date range selector (7 days, 30 days, quarter), daily revenue chart, status distribution pie chart, top-selling dishes by volume and revenue, and one-click **CSV Report Export**.

---

## 2. Design System & Refined Palette

The interface strictly adheres to the requested color tokens and typography hierarchy:

| Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary Background** | `#F8F6F1` | Warm off-white background throughout customer screens |
| **Main Surface** | `#FFFFFF` | Crisp white cards, modals, and operational workspaces |
| **Primary Text** | `#242521` | Deep charcoal for readable headings and body copy |
| **Secondary Text** | `#77776F` | Muted stone gray for captions, timestamps, and metadata |
| **Accent Green** | `#285943` | Rich forest green for primary actions and brand wordmarks |
| **Subtle Borders** | `#E7E3DA` | Hairline warm gray borders defining clean rectangular geometry |
| **Destructive / Alert**| `#9E2A2B` | Restrained brick red for cancellations and non-veg diet badges |
| **Success / Veg** | `#2A7A4C` | Muted sage green for completion badges and vegetarian diet icons |

- **Typography**: Google Fonts `Playfair Display` (editorial serif for restaurant branding and dish headings) paired with `Plus Jakarta Sans` / `Inter` (sans-serif for dense operational tables, buttons, and prices).
- **No Gimmicks**: Zero neon gradients, zero glassmorphism, no fake placeholder stats, and no emoji interface icons (clean `lucide-react` iconography throughout).

---

## 3. Technology Stack

- **Frontend**:
  - React 19 + TypeScript
  - Vite 8.3
  - Tailwind CSS 3.4
  - React Router v7 (`react-router-dom`)
  - Lucide React icons
  - Recharts (responsive analytics)
- **Backend**:
  - Node.js 24 + Express 4.21
  - TypeScript + `tsx` watch runner
  - Prisma ORM 5.22
  - PostgreSQL 18
  - `bcryptjs` (password hashing)
  - `jsonwebtoken` (JWT authentication & RBAC)
  - `zod` (request validation)
  - `cors`

---

## 4. Database Schema (PostgreSQL via Prisma)

- **`User`**: Accounts, hashed passwords, contact details, role (`ADMIN`, `CUSTOMER`).
- **`Address`**: Customer delivery destinations with default address flag.
- **`Category`**: Menu taxonomy with sort order and active state.
- **`MenuItem`**: Dishes, descriptions, exact decimal prices (`Decimal(10, 2)`), image URLs, prep times, spice scales, allergens, and availability flag.
- **`MenuItemAddon`**: Customizations and accompaniments with individual prices.
- **`Order`**: Unique reference numbers (`ORD-YYYYMMDD-XXXX`), customer details, order type, delivery address, notes, subtotal, tax (5%), delivery fee, coupon discount, total amount, payment method, payment status, current status, and timestamps.
- **`OrderItem`**: **Immutable snapshot** of item name, unit price, quantity, subtotal, and serialized addons captured at order placement time.
- **`OrderStatusHistory`**: Timestamped audit trail recording who transitioned the status and why.
- **`Coupon`**: Promotional discount codes (`ROYAL10`, `FIRSTBITE`, `FEAST20`).

---

## 5. Development Credentials

The database has been seeded with realistic accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Restaurant Administrator** | `admin@dastaan.com` | `Admin@12345` | Full access to `/admin` dashboard, orders, menu, CRM, and reports |
| **Patron / Customer** | `rahul.sharma@example.com` | `Customer@123` | Order history, profile addresses, customer storefront |
| **Patron / Customer 2** | `priya.nair@example.com` | `Customer@123` | Order history, active orders |

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+) & npm
- PostgreSQL running on localhost:5432 with database `food_order_db`

### 1. Database Setup
```bash
# In server directory:
cd server
npm install
npx prisma db push
npx tsx prisma/seed.ts
```

### 2. Start Backend API
```bash
# In server directory:
npm run dev
# Starts API on http://localhost:5000
```

### 3. Start Frontend Client
```bash
# In client directory:
cd ../client
npm install
npm run dev
# Starts Vite application on http://localhost:5173
```

---

## 7. Verified Acceptance Criteria

- [x] **1. Customer Menu**: Real PostgreSQL records loaded with images, descriptions, prices in INR (₹), and dietary indicators.
- [x] **2. Dish Customizations**: Accompaniments dynamically selected and aggregated into cart totals.
- [x] **3. Server-Validated Pricing**: Subtotals, 5% GST, packaging fees, and discounts computed securely on backend inside database transactions.
- [x] **4. Order Persistence**: Complete snapshot saved in PostgreSQL with unique order reference (`ORD-YYYYMMDD-XXXX`).
- [x] **5. Secure Authentication**: Password hashing with bcrypt, JWT token validation, and role-based access control.
- [x] **6. Operational Dashboard**: Real-time KPIs for orders today, kitchen queue, today's sales, and AOV.
- [x] **7. State-Machine Status Transitions**: Validated lifecycle (`PLACED` → `CONFIRMED` → `PREPARING` → `OUT_FOR_DELIVERY` → `COMPLETED`) with cancellation protection.
- [x] **8. Live Customer Tracking**: Chronological status timeline and audit log reflecting actual database changes.
- [x] **9. Menu Management**: Full CRUD, item editing modal, and live availability toggling.
- [x] **10. Category Safeguards**: Reassignment protection preventing orphaned dishes when categories are deleted.
- [x] **11. Customer CRM**: Real lifetime spend and order count aggregated from database orders.
- [x] **12. Financial Reports & CSV**: Daily revenue trend chart, best-selling dishes, and downloadable CSV export.
- [x] **13. Security Boundaries**: Unauthenticated and non-admin requests to protected endpoints rejected with 401/403.
- [x] **14. Production Build**: Zero TypeScript errors, clean production bundle compiled with Vite.

# Ritesh_NTCC
