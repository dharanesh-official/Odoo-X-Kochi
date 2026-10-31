# Subscription Manager - Feature Implementation Walkthrough

This document explains the technical architecture and implementation details for the major feature updates requested on Feb 7, 2026.

## 1. Internal User Roles & Permissions
### How it works:
- **Database**: A `profiles` table was created/extended to include a `role` column (`admin`, `internal`, `customer`).
- **Logic**: The `app/admin/users` module allows admins to manage these roles. Roles are checked on the server side using Supabase Auth and the profiles table.
- **Access Control**: Row Level Security (RLS) in Supabase ensures that only relevant users can access specific data.

## 2. Product Features (Pricing & Variants)
### How it works:
- **Pricing**: `sales_price` and `cost_price` were added to the `products` table. These are managed in the Product Edit form.
- **Variants**: Tables `product_attributes` and `product_attribute_values` were introduced. This allows defining things like 'Size' or 'Color' with extra pricing per value.
- **UI**: The product edit form was updated to support these financial fields.

## 3. Recurring Plan Options (Advanced Toggles)
### How it works:
- **New Fields**: `start_date`, `end_date`, `auto_close`, `closable`, `pausable`, and `renewable` were added to the `plans` table.
- **Operations**: `app/admin/plans/actions.ts` now handles these dates and toggles, which can be used by the subscription engine to automatically expire or renew plans.

## 4. Subscription Order Lines (Multi-Product)
### How it works:
- **Architecture**: Shifted from a single-plan model to a Line Item model via the `subscription_lines` table.
- **Calculation**: Total subscription amount is now derived from the sum of all lines (Quantity * Unit Price) minus discounts.
- **Flexibility**: This allows a single subscription to include multiple services (e.g., Software License + Support + Setup Fee).

## 5. Quotation Templates
### How it works:
- **New Module**: `app/admin/quotations` was created. 
- **Templates**: Users can create predefined "bundles" of products and plans. When creating a new subscription, selecting a template automatically populates the order lines.

## 6. Invoice Actions & Payments
### How it works:
- **Invoice Actions**: "Cancel" and "Send" (email) actions were implemented in `app/admin/invoices/actions.ts`.
- **Payments Management**: A dedicated `payments` table and UI module (`app/admin/payments`) were added to track settlements separate from invoice status.
- **Linkage**: Registering a payment updates the associated invoice status and records the transaction ID and method.

## 7. Reporting & Analytics
### How it works:
- **Real-time Data**: The dashboard (`app/admin/dashboard/page.tsx`) was rewritten to use aggregate SQL queries instead of mock data.
- **Metrics**: Total Revenue is summed from `paid` invoices; Subscriptions are counted live from the DB.
- **Charts**: Placeholders are provided for integration with charting libraries based on the live data feeds.

## 8. Tax & Discount Management
### How it works:
- **Tax UI**: `app/admin/taxes` allows dynamic configuration of tax rates (e.g., GST 18%). The system automatically picks these up during invoice generation.
- **Discount Engine**: `discounts` table supports both percentage and fixed-amount rules with validity limits.

---

### How to Verify:
1.  Run the `schema_v2.sql` in your Supabase SQL Editor.
2.  Refresh the application; notice the new Sidebar menu items.
3.  Go to **Internal Users** to promote your account to Admin if needed.
4.  Visit **Dashboard** to see live calculations.
5.  Use **Payments** to settle invoices.
