# Al Maas Bakery – Checkout System & Admin Dashboard Guide

This document outlines the architecture, features, and setup instructions for the **Al Maas Bakery** Checkout System and Secure Admin Dashboard.

---

## 🚀 What Was Implemented

### 1. Modern, Responsive Checkout Page (`/checkout`)
- **Customer Information Collection**:
  - Full name
  - 10-digit mobile number with validation
  - Optional WhatsApp number (with "Same as mobile" toggle)
  - House / flat / building number
  - Street / area / locality
  - City (default: Bengaluru) & 6-digit PIN code
  - Optional delivery instructions
- **Order Summary**:
  - Product thumbnails, names, individual prices, and quantities
  - Subtotal calculation
  - Calculated delivery distance and dynamic delivery fee
  - Final total payable amount
  - Payment mode: Cash on Delivery / UPI upon arrival

### 2. Dynamic Distance-Based Delivery Price Calculation
- **Shop Location Origin**: Al Maas Bakery, Sultan Palya Main Road, Bengaluru (`13.0279242, 77.5282725`)
- **Location Detection**:
  - **Google Maps Places Autocomplete**: Integrates with Google Places API when `VITE_GOOGLE_MAPS_API_KEY` is provided.
  - **GPS Location Detector**: One-click "Detect My Location" button using HTML5 Geolocation and reverse geocoding.
  - **Manual Address Estimation**: Automatic fallback coordinate lookup.
- **Distance Calculation**: High-precision **Haversine formula** (`calculateHaversineDistance`) measuring distance in kilometers.
- **Configurable Distance Tiers**:
  - 0 – 2 km: ₹20
  - 2 – 5 km: ₹40
  - 5 – 8 km: ₹60
  - 8 – 15 km: ₹100
  - Above 15 km (or custom max): Delivery marked as unavailable.
- Fully editable from the Admin Dashboard!

### 3. Order Placement & Confirmation
- Server & database validation of prices and delivery charges before saving.
- Generates unique Order IDs formatted as `AMB-YYYYMMDD-XXXX`.
- **Order Confirmation Screen**:
  - Celebration checkmark
  - Complete customer & delivery address summary
  - Ordered items breakdown
  - Live status tracking badge: `Pending`, `Confirmed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`
  - One-click **"Share Order on WhatsApp"** button sending pre-formatted order details to the bakery WhatsApp.

### 4. Slide-in Cart Drawer (`CartDrawer`) & Navbar Integration
- Shopping bag icon with dynamic badge count added to the Navbar.
- Click to open a slide-in Cart Drawer on any page with increment/decrement, remove, and "Proceed to Checkout".
- Floating bottom checkout bar on `/menu` when items are in cart.
- Persistent cart state in `localStorage` across page refreshes.

### 5. Secure Admin Dashboard (`/admin`) & Login (`/admin/login`)
- Dedicated login page at `/admin/login`.
- **Credentials**:
  - Default Password: `AlMaas@Admin2026`
  - Configurable via `VITE_ADMIN_PASSWORD` in `.env`.
- Route guards: Unauthenticated users attempting to access `/admin` are automatically redirected to `/admin/login`.
- Dedicated full-screen admin layout (public navbar, footer, and chatbot are isolated).
- One-click sign-out with session revocation.

### 6. Admin Sections
1. **Overview**:
   - Total Orders, Today's Orders, Total Revenue (₹), Pending Orders, Completed Orders, Menu Items count.
   - Status distribution progress bars.
   - Recent orders table with immediate status changer.
2. **Menu Management (Full CRUD)**:
   - Search by name, category, or description.
   - Category and availability filters.
   - Add new products (name, category, price, sale price, weight, description, image URL, availability).
   - Edit existing products.
   - Delete products with custom confirmation modal.
   - One-click "In Stock" / "Out of Stock" toggle with instant reflection on the customer-facing website.
3. **Order Management**:
   - Search by Order ID, customer name, mobile, or address.
   - Filter by status (`Pending`, `Confirmed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`).
   - Filter by date (`Today`, `Past 7 Days`, `All`).
   - Order Details Modal with customer contact, WhatsApp link, address, items, distance, and fee.
   - Update order status directly from dropdown.
   - Cancel Order dialog with reason logging.
4. **Activity History & Audit Logs**:
   - Permanent, tamper-proof record of all admin activities.
   - Tracks: admin logins/logouts, product creation/editing/deletion/price changes/availability toggles, order status changes/cancellations, and delivery settings changes.
   - Search and filter by action type or date.
   - Value comparison diffs (`Old Value` vs `New Value`).
5. **Delivery Settings**:
   - Configurable bakery shop location address and latitude/longitude coordinates.
   - Enable/disable delivery toggle.
   - Minimum order amount.
   - Maximum delivery distance (km).
   - Interactive table to add, modify, or remove distance range pricing tiers.

---

## 🗄️ Database Setup (Supabase PostgreSQL)

The application features a **dual-mode data architecture**:
1. **Immediate Zero-Config Mode**: Works 100% out of the box using persistent storage seeded with all 100+ bakery products and default delivery settings.
2. **Supabase PostgreSQL Mode**: Connect your live Supabase project by simply adding your credentials to `.env`.

### To Connect Supabase:
1. Open your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.
3. Open `supabase-schema.sql` located at the root of `bakeHouse/`, copy all its contents, paste them into the Supabase SQL Editor, and click **Run**.
4. In your `.env` file, set:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Restart your dev server (`npm run dev`). The app will immediately connect to your live PostgreSQL database!

---

## 🔑 Admin Credentials
- **Login URL**: `http://localhost:5173/admin/login` (or `/admin/login` on production)
- **Default Password**: `AlMaas@Admin2026`
- **To Change Password**: Set `VITE_ADMIN_PASSWORD=YourNewPassword` in `.env`.

