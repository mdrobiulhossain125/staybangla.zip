# StayBangla
1. `npm i` 2. `.env.local` (see `.env.example`) 3. Run `supabase/migrations/0001_init.sql` in Supabase SQL editor (or `supabase db push`)
4. Auth > URL config: add your site URL + `/dashboard` redirect. 5. Make yourself admin: `update profiles set role='super_admin' where id='<your user id>';`
6. `npm run dev` · Deploy: push to GitHub, import in Vercel, add the two env vars.
