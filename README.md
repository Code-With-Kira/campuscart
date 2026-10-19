# 🛒 CampusCart

### Your Campus Essentials, All in One Place

**CampusCart** is a modern, responsive, campus-inspired e-commerce web application developed as an academic project for **ITE 18**.

Designed with students in mind, CampusCart provides a convenient platform for browsing school supplies, technology accessories, and campus merchandise through an intuitive shopping experience.

The application features a customer-facing storefront, shopping cart, checkout interface, order management, and an administrative dashboard.

Its frontend is built using modern web technologies and organized for future backend and database integration.

> **Project Status:** Frontend development completed. Backend and database integration are pending.
>
> **Disclaimer:** CampusCart is an independent academic demonstration project inspired by campus life and Caraga State University's visual identity. It is not an official university store. Transactions and payments are currently simulated.

---

## 🚀 Features

### Customer Features
- **Responsive Homepage** — Modern storefront featuring product categories, featured products, and new arrivals.
- **Product Catalog** — Browse products with search, filtering, sorting, and pagination.
- **Product Details** — View product descriptions, pricing, availability, and images.
- **Shopping Cart** — Add, update, and remove products using Pinia state management.
- **User Authentication Interface** — Registration, login, and customer account management.
- **Customer Profile** — View account information and manage saved addresses.
- **Checkout System** — Simulated order placement with campus pickup and Cash on Pickup.
- **Order Management** — View order history, order details, and order statuses.

### Administrator Features
- Administrative dashboard
- Product management interface
- Category management interface
- Order monitoring and status management
- Inventory monitoring
- Payment record monitoring

### Frontend Architecture
- Responsive design for desktop, tablet, and mobile
- Reusable Vue components
- TypeScript-based data models
- Centralized API service modules
- Configurable branding and store information
- Support for product image galleries and fallback images
- Form validation and error handling
- Backend integration documentation

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **Nuxt 4** | Vue application framework and routing |
| **Vue 3** | Component-based user interfaces |
| **TypeScript** | Type-safe application development |
| **Pinia** | Frontend state management |
| **Tailwind CSS 4** | Responsive styling and design |
| **Nitro / Nuxt Server API** | Temporary mock API endpoints |
| **Git & GitHub** | Version control and collaboration |

---

## 📂 Project Structure

```text
campuscart/
├── app/
│   ├── components/       # Reusable UI components
│   ├── config/           # Storefront and branding configuration
│   ├── pages/            # Customer and administrator pages
│   ├── services/         # API communication
│   ├── stores/           # Pinia state management
│   ├── types/            # TypeScript data models
│   └── utils/            # Shared utilities
├── server/
│   └── api/v1/           # Temporary mock API endpoints
├── public/               # Images, icons, and static assets
├── docs/                 # Project and backend handoff documentation
├── scripts/              # Verification scripts
├── nuxt.config.ts
├── package.json
├── .env.example
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (a version supported by the project's `package.json`)
- npm
- Git
- Visual Studio Code or another code editor

### 1. Clone the Repository

```bash
git clone https://github.com/Code-With-Kira/campuscart.git
cd campuscart
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file using `.env.example` as the reference.

The default local configuration uses the existing mock API:

```dotenv
NUXT_PUBLIC_API_BASE=/api/v1
NUXT_PUBLIC_ENABLE_DEMO_PREVIEW=false
```

The API base URL can be updated once the backend team's services are ready.

### 4. Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

**http://localhost:3000**

### 5. Build for Production

```bash
npm run build
```

### 6. Run Type Checking

```bash
npx nuxt typecheck
```

---

## 🎨 UI/UX Design

CampusCart follows a clean, accessible, and student-friendly design inspired by the colors of Caraga State University.

The visual identity uses:

- Dark
