# AI Income Blueprint — React + Supabase

Course landing page with PalmPay payment, receipt upload, admin approval,
and automatic email with the WhatsApp class link.

- `/` landing page + registration
- `/status` students check their payment status
- `/admin` you review receipts and approve/reject

## 1. Supabase
1. Create a project, open **SQL Editor**, paste and run `supabase/schema.sql`.
2. **Authentication → Users → Add user**: create your admin login.
3. Run the last line of the SQL file with your email to make yourself admin.
4. **Authentication → Sign In / Providers**: turn off "Allow new users to sign up".
5. **Authentication → URL Configuration**: set Site URL to `https://course.hoblemercy.dev`.

## 2. Email (Resend)
1. Add and verify `hoblemercy.dev` in Resend (add its DNS records).
2. Create an API key.

## 3. Edge Function
```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set RESEND_FROM="AI Income Blueprint <class@hoblemercy.dev>"
supabase secrets set WHATSAPP_GROUP_LINK="https://chat.whatsapp.com/YOUR-LINK"
supabase secrets set SITE_URL="https://course.hoblemercy.dev"
supabase functions deploy review-enrollment
```
If approving returns "Invalid JWT", redeploy with `--no-verify-jwt`
(the function already checks the admin itself).

## 4. Run locally
```bash
cp .env.example .env   # fill in your Supabase URL + anon key
npm install
npm run dev
```
Put your flyer image at `public/flyer.jpg`.

## 5. Deploy
Push to GitHub → import in Vercel → add the two `VITE_` env variables →
Settings → Domains → add `course.hoblemercy.dev`.

## Edit course details
`src/config.js` (price, PalmPay number, account name).
