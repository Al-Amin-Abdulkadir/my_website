# Deploying the site (free hosting)

The code is ready for Vercel. Do these steps **in order**, and push `main` last —
pushing is what deploys, and the site needs the API and database to exist first.
Secrets never go in the code: `cms-api/.env` is git-ignored, and on Vercel they
live in each project's Environment Variables.

## How it's set up (all free tiers)
- **Vercel project 1 — the website** (your existing project). `vercel.json` sends
  `/api/...` to project 2 (so the browser sees one domain and the login cookie
  works) and every page address to the React app.
- **Vercel project 2 — the CMS API**, from the `cms-api` folder. Vercel detects
  FastAPI from `app/main.py`; Python 3.12 is set in `cms-api/.python-version`.
- **Neon** — the Postgres database.
- **Cloudinary** — photos and videos, uploaded straight from the editor
  (free plan: up to 10 MB per image, 100 MB per video).

## Your steps
1. **Neon:** create a project, then copy its **pooled** connection string
   (the address contains `-pooler`).
2. **Cloudinary:** Settings → API Keys → copy the cloud name, API key and API secret.
   Also add them to `cms-api/.env` (see `.env.example`) so uploads work locally.
3. **Copy your local database to Neon** — so the live site starts with everything
   you've built in the CMS (projects, edits, Home photos, colours), not the original
   import. From the project folder:
   ```
   pg_dump --no-owner --no-privileges portfolio_cms | psql '<neon pooled url>'
   ```
   (Use this on an EMPTY Neon database. It brings the tables, your content and the
   migration history across, so no separate `alembic upgrade` is needed here.)
4. **Change the live login** — the copy brought your local login across, so set a NEW
   password for the live site (different from your local one):
   `DATABASE_URL='<neon pooled url>' .venv/bin/python -m app.set_admin_password`
   and a NEW secret key: `python3 -c "import secrets; print(secrets.token_urlsafe(48))"`
5. **Resend** (for the "Forgot password?" 6-digit codes): sign up at resend.com with your admin
   email and create an API key. (Its free sender `onboarding@resend.dev` can only
   email the address you signed up with — which is exactly the admin's.)
6. **Create Vercel project 2** from the same GitHub repo: Add New → Project →
   Root Directory = `cms-api`, name it **`alamin-portfolio-cms`**
   (if you pick another name, change the address in `vercel.json` to match).
   Environment Variables:
   `DATABASE_URL`, `SECRET_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`, and `RESEND_API_KEY` (a NEW key for the live site).
   Never put any of these in a `VITE_` variable — those end up public in the website.
7. **Push `main`.** Both projects deploy. Then check:
   `https://alamin-portfolio-cms.vercel.app/api/health` → `{"ok": true}`,
   then the site, then log in at `/admin`.
