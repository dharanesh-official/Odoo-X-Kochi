
# 🏆 Hackathon Winning Demo Strategy: Subscription Management ERP

## 🚀 Project Overview
**SubCheck** is an enterprise-grade Recurring Revenue Engine built on a zero-cost stack (Next.js + Supabase). It automates the entire "Quote-to-Cash" lifecycle for B2B SaaS companies.

## 🛠️ Tech Stack & Architecture
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Shadcn UI.
- **Backend**: Supabase (PostgreSQL, Auth, RLS).
- **Logic**: Server Actions (No API routes needed).
- **Design**: "Human-Crafted" Enterprise UI.

## 🎬 Demo Script (Walkthrough Plan)

### Step 1: The "Executive Dashboard" (Admin View)
*   **Narrative**: "Imagine you're the CFO. You need instant visibility into MRR."
*   **Action**: Log in as Admin. Show the Dashboard with KPI cards.
*   **Highlight**: Real-time data fetching, clean layout.

### Step 2: The "Product Engine"
*   **Narrative**: "Launching a new pricing tier takes seconds, not sprint cycles."
*   **Action**: 
    1. Go to **Products** -> Create "Enterprise CRM".
    2. Go to **Plans** -> Create "Annual License ($999/year)".
*   **Highlight**: Relational data integrity (Product -> Plan).

### Step 3: The "Sales Quotation"
*   **Narrative**: "Sales team needs to close a deal fast."
*   **Action**: 
    1. Go to **Subscriptions -> New Subscription**.
    2. Select a Customer + Plan.
    3. Choose "Draft" status (Show estimated price preview).
    4. Click **Create Quotation**.

### Step 4: The "Automated Billing"
*   **Narrative**: "The customer signed. Let's activate billing."
*   **Action**: 
    1. Open the Draft Subscription.
    2. Change Status to **Active**.
    3. **Magic Moment**: Show that an **Invoice** was automatically generated in `Invoices` tab.

### Step 5: The "Customer Experience"
*   **Narrative**: "The client gets a professional portal."
*   **Action**: 
    1. Log in as Customer (Incognito window).
    2. Show the **Customer Dashboard** (Active Plan, Renewal Date).
    3. Show **My Invoices** list.

## 📦 Deployment Instructions (Free Tier)
1.  **Vercel**: Push code to GitHub -> Import to Vercel.
2.  **Env Vars**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3.  **Build**: Automatic. Default settings work out of the box.

## 🔑 Admin Setup
To make yourself an admin, run this SQL in Supabase Editor:
```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

## ⚠️ Hackathon Constraints Met
- [x] Free Tier Only (Vercel + Supabase).
- [x] Responsive Design (Mobile Sidebar + Grid).
- [x] Business Logic (Tax Calc, Dates, Status State Machine).
- [x] Security (RLS + Auth Middleware).
