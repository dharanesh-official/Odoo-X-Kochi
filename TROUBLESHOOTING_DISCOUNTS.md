# Fix: "Create Discount" Button Not Working

## Problem
When clicking the "Create Discount" button, nothing happens. The error message shows:
> "Could not find the 'name' column of 'discounts' in the schema cache"

## Root Cause
The `discounts` table in your Supabase database either:
1. Doesn't exist yet, OR
2. Exists but is missing required columns

## Solution

### Step 1: Fix the Database Schema

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Log in and select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Fix Script**
   - Open the file: `FIX_DISCOUNTS_SCHEMA.sql` (in your project root folder)
   - Copy ALL the SQL content from that file
   - Paste it into the SQL Editor
   - Click the **Run** button (or press Ctrl+Enter)

4. **Verify the Results**
   - Scroll down to see the query results
   - You should see a table showing all columns of the `discounts` table
   - Look for columns: `id`, `name`, `type`, `value`, `description`, `product_id`, `active`, etc.
   - If you see these columns, the fix was successful!

### Step 2: Restart Your Development Server

1. **Stop the current dev server** (if running)
   - Press `Ctrl+C` in the terminal where `npm run dev` is running

2. **Start it again**
   ```bash
   npm run dev
   ```

3. **Wait for it to compile**
   - You should see: `✓ Ready in X ms`

### Step 3: Test the Discount Creation

1. **Refresh the browser page**
   - Press F5 or Ctrl+R on the `/admin/discounts` page

2. **Fill in the form**
   - Discount Name: "Test Discount"
   - Description: "Testing"
   - Type: Percentage (%)
   - Value: 10
   - Check the "Active" checkbox

3. **Click "Create Discount"**
   - You should see a success toast message
   - The discount should appear in the table on the right

### Step 4: Check Console Logs (If Still Not Working)

If the button still doesn't work after running the SQL fix:

1. **Open Browser Developer Tools**
   - Press F12 in your browser
   - Click the "Console" tab

2. **Click "Create Discount" again**
   - Look for any error messages in red
   - Look for console.log messages showing the discount data

3. **Check the Network Tab**
   - Click the "Network" tab in Developer Tools
   - Click "Create Discount"
   - Look for any failed requests (shown in red)
   - Click on the failed request to see the error details

## What the SQL Fix Does

The `FIX_DISCOUNTS_SCHEMA.sql` script:
- ✅ Creates the `discounts` table if it doesn't exist
- ✅ Adds all required columns (`name`, `type`, `value`, etc.)
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates database indexes for better performance
- ✅ Links discounts to the `plans` table
- ✅ Verifies the table structure

## Expected Behavior After Fix

1. **No error message** at the top of the page
2. **Button works** - clicking "Create Discount" submits the form
3. **Success message** appears as a toast notification
4. **Discount appears** in the table on the right side
5. **Form clears** and is ready for the next discount

## Still Having Issues?

If you've completed all steps and it's still not working:

1. Check the browser console for JavaScript errors
2. Check the terminal where `npm run dev` is running for server errors
3. Verify your Supabase connection in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Make sure you're logged in as an admin user (check the `profiles` table, `role` column should be 'admin')
