# TN-Naun Designer Website — বাংলা সেটআপ

এটি TN-Naun Designer-এর Next.js ওয়েবসাইট প্রজেক্ট। মূল Welcome page, Portfolio, About, Studio, Services, Reviews, Contact, Account, Admin Dashboard এবং Royal/Gold Card flow রাখা হয়েছে। বিদ্যমান ডিজাইনের CSS ও পেজের কনটেন্ট অকারণে নতুন করে ডিজাইন করা হয়নি।

## প্রজেক্টে যা আছে
- Welcome Homepage এবং public portfolio pages।
- Supabase email/password authentication।
- Admin Dashboard, Client Inbox, Portfolio project add/edit/publish/delete এবং Card Request review/Approve/Reject/Revoke action।
- Royal Card approval: আবেদনকারীর account-এ administrator role যোগ হয়।
- Gold Card: shared password যাচাইয়ের পরও administrator approval লাগে; approval হলে private Gold Card portal খোলে, Admin Dashboard নয়।
- Admin device-এ opt-in web push notification (VAPID key এবং browser permission সেটআপ প্রয়োজন)।
- Supabase database schema এবং portfolio image assets।

## গুরুত্বপূর্ণ নিরাপত্তা নোট
- Royal Card approve করলে সেই account-কে পূর্ণ Admin Dashboard access দেওয়া হয়। শুধু বিশ্বস্ত ব্যক্তির ক্ষেত্রেই approve করবে। Revoke করলে admin role সরানো হয়।
- Royal/Gold request পাঠাতে আবেদনকারীকে আগে website account তৈরি করে sign in করতে হবে। Request-এর email অবশ্যই signed-in account-এর email-এর সঙ্গে মিলতে হবে।
- Gold password browser-এ hard-code করা নেই; server-side bcrypt hash দিয়ে যাচাই হয়।
- `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY` এবং plain Gold Card password কখনো GitHub-এ commit করবে না। এগুলো শুধু hosting provider-এর Environment Variables-এ রাখবে।
- Push notification পেতে Admin Dashboard-এ গিয়ে “Enable notifications on this device” চাপতে হবে। Browser notification permission দিতে হবে। Push-এর জন্য HTTPS এবং VAPID keys লাগবে। iPhone-এ Web Push ব্যবহারের জন্য সমর্থিত iOS সংস্করণে ওয়েবসাইট Home Screen-এ যোগ করা লাগতে পারে।
- Browser push বন্ধ/permission denied থাকলে Admin Dashboard-এর Notifications তালিকায় request record থাকবে; push delivery নিশ্চিত নয়।
- কোনো website browser-এর screenshot পুরোপুরি আটকাতে পারে না।

## ১. প্রয়োজনীয় অ্যাকাউন্ট
- GitHub
- Supabase
- Vercel (অথবা Next.js সমর্থিত hosting)

## ২. Supabase Database সেটআপ
1. Supabase-এ একটি project তৈরি করো।
2. SQL Editor খুলে `supabase/schema.sql`-এর সম্পূর্ণ SQL চালাও।
3. Project Settings → API থেকে Project URL, anon key এবং service_role key সংগ্রহ করো।
4. Authentication → URL Configuration-এ local এবং deployed site URL যোগ করো।
5. Authentication → Providers-এ Email sign-in চালু রাখো।
6. `portfolio` Storage bucket private থাকবে।

যদি আগের schema ইতিমধ্যে চালানো থাকে, নতুন SQL-এর `ALTER TABLE` migration `card_requests.user_id` যোগ করবে এবং `push_subscriptions` table তৈরি করবে। Production database-এ SQL চালানোর আগে backup রাখবে।

## ৩. প্রথম Admin account তৈরি
1. `/auth` পেজে নিজের email দিয়ে account তৈরি করো এবং প্রয়োজন হলে email confirm করো।
2. একই account দিয়ে sign in করো।
3. Supabase → Authentication → Users থেকে নিজের User UID কপি করো।
4. Supabase SQL Editor-এ চালাও (UUID বদলে নিজের UID বসাবে):

```sql
insert into public.admin_users (user_id)
values ('YOUR-USER-UUID')
on conflict (user_id) do nothing;
```

5. `/admin/login` থেকে sign in করলে Admin Dashboard খুলবে।

## ৪. Environment Variables
1. `.env.example` কপি করে `.env.local` নামে রাখো।
2. Supabase URL, anon key ও service_role key বসাও।
3. Gold Card password-এর bcrypt hash তৈরি করো:

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('YOUR-STRONG-PASSWORD',12))"
```

4. আউটপুটটি `GOLD_CARD_PASSWORD_HASH`-এ বসাও। Plain password কোথাও commit করবে না।
5. Push notification চালু করতে VAPID keys তৈরি করো:

```bash
npx web-push generate-vapid-keys
```

Public key `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, private key `VAPID_PRIVATE_KEY` এবং `VAPID_SUBJECT`-এ নিজের যোগাযোগের email বসাও।

## ৫. লোকাল রান ও পরীক্ষা

```bash
npm install
npm run dev
```

তারপর `http://localhost:3000` খোলো। TypeScript check:

```bash
npm run typecheck
```

Production build:

```bash
npm run build
```

## ৬. GitHub-এ আপলোড
- ZIP Extract করো।
- `node_modules`, `.next`, `.env.local` বা secret key আপলোড করবে না।
- `TNN-Designer` project root-এর ভেতরের সব ফাইল ও প্রয়োজনীয় subfolder একই কাঠামোয় repository-তে রাখবে।
- GitHub web upload-এ folder structure বজায় রাখা কঠিন হতে পারে; GitHub Desktop বা কম্পিউটারের Git ব্যবহার করলে পুরো project একসঙ্গে commit/push করা সহজ।

## ৭. Vercel Deploy
1. GitHub repository Vercel-এ import করো।
2. `.env.local`-এর প্রয়োজনীয় environment variables Vercel Project Settings → Environment Variables-এ যোগ করো।
3. Deploy করো এবং deployed URL-এ সব route পরীক্ষা করো।
4. Supabase Authentication URL Configuration-এ deployed URL যোগ করো।
5. Push notification ব্যবহার করলে deployed site HTTPS-এ চালু করে Admin device থেকে push enable করো।

## সীমাবদ্ধতা / পরবর্তী উন্নয়ন
- Portfolio project editor Admin Dashboard-এ আছে; project image upload-এর বদলে আপাতত hosted image URL দিতে হয়। About/Services/Studio-এর static লেখা এখনো সরাসরি code থেকে পরিবর্তন করতে হয়; পুরো সাইটের visual CMS নেই।
- Push notifications best-effort web push; সব device/browser-এ একইভাবে কাজের নিশ্চয়তা নেই।
- Production launch-এর আগে rate limiting, CAPTCHA/spam protection, privacy policy, data retention, database backup, access audit এবং end-to-end security testing যোগ করা উচিত।
