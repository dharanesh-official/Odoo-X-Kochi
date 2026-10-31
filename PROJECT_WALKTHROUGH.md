# SubCheck - Project Walkthrough & Workflow Guide

## 1. Project Overview
**SubCheck** is a comprehensive Subscription Management System designed to help businesses manage their recurring billing, products, plans, and customer subscriptions efficiently. It features a dual-interface system:
*   **Admin Portal:** For business owners to manage everything.
*   **Customer Portal:** For end-users to view their subscriptions and pay invoices.

---

## 2. The Core Workflow (Step-by-Step Demo)

Use this flow to demonstrate the project to your mentor. It tells a logical story of how the system is used.

### Phase 1: Setup (The Foundation)
*Goal: Show how a business prepares to sell subscriptions.*

1.  **Login as Admin:** Start by logging into the Admin Dashboard.
2.  **Create a Product:**
    *   Go to **Products** in the sidebar.
    *   Explain: "Products are the services or items we sell, like 'Video Streaming' or 'Gym Membership'."
    *   Action: Create a new product (e.g., "Premium Support").
3.  **Create a Pricing Plan:**
    *   Go to **Plans**.
    *   Explain: "Plans define how we charge for a product (e.g., Monthly vs Yearly)."
    *   Action: Create a plan for the product you just made (e.g., "Gold Plan - ₹999/month").

### Phase 2: Customer Management
*Goal: Show how you handle client data.*

1.  **Add a Customer:**
    *   Go to **Customers**.
    *   Action: Create a new customer profile.
    *   Highlight: You capture essential details like Name, Email, and Phone.

### Phase 3: The Subscription Lifecycle (The Main Feature)
*Goal: Demonstrate the full sales cycle from initial quote to active billing.*

1.  **Create a Subscription (Draft):**
    *   Go to **Subscriptions** -> **Create Subscription**.
    *   Select the Customer and the Plan you created.
    *   **Status: Draft**. Explain: "We start as a draft to prepare the details."
2.  **Send Quotation:**
    *   Change status to **Quotation**.
    *   Explain: "We can now send this quotaion to the customer for approval."
3.  **Confirm Subscription:**
    *   Change status to **Confirmed**.
    *   Explain: "The customer has agreed to the terms."
4.  **Activate Subscription (Auto-Invoice Trigger):**
    *   **CRITICAL STEP:** Click **Activate**.
    *   **Magic Moment:** Explain that **activating the subscription automatically generates the first Invoice**.

### Phase 4: Billing & Payments
*Goal: Show how the system handles money.*

1.  **View Invoices:**
    *   Go to **Invoices**.
    *   Show the new invoice (auto-generated from the previous step).
    *   Open the Invoice details.
2.  **Print/Send Invoice:**
    *   Show the **Print** button (demonstrate the clean print layout).
    *   Show the **Send Email** button (simulates sending the invoice to the customer).
3.  **Record Payment:**
    *   Click **Record Payment**.
    *   Enter a transaction ID and amount.
    *   **Result:** Invoice status changes to **Paid**.

### Phase 5: The Customer Experience
*Goal: Show the user-facing side.*

1.  **Customer Dashboard:**
    *   (Optional if you have a customer login ready) Switch to a customer account.
    *   Show them their **My Subscriptions** page.
    *   Show them their **Invoices** history.

---

## 3. Key Technical Features to Highlight

When your mentor asks "What makes this project special?", mention these:

1.  **Role-Based Access Control (RBAC):** Secure login separates Admins from Customers.
2.  **Automated Workflows:** Activating a subscription automatically creates invoices, reducing manual work.
3.  **Print-Ready Invoices:** Custom CSS ensures invoices look professional when printed (hides sidebars/buttons).
4.  **Real-Time Dashboard:** Overview of total customers, active plans, and revenue.
5.  **Tech Stack:** Built with **Next.js 14**, **Supabase (PostgreSQL)**, and **Tailwind CSS** for modern performance and design.

---

## 4. Q&A Cheat Sheet

*   **Q: How do you handle taxes?**
    *   A: "We have a Taxes module where we can define active tax rates (e.g., GST 18%). These are automatically calculated and added to every invoice."
*   **Q: Can a subscription have multiple plans?**
    *   A: "Yes, our data model supports subscription lines, allowing multiple products to be bundled into a single subscription."
*   **Q: Is it responsive?**
    *   A: "Yes, the layout adapts to mobile devices, with a collapsible sidebar and responsive tables."
