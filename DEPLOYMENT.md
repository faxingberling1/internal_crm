# Vercel Deployment Guide

## Prerequisites
- Vercel account
- Git repository pushed to GitHub/GitLab/Bitbucket

## Step 1: Push Code to Git

```bash
git add .
git commit -m "Prepare for Vercel deployment with PostgreSQL"
git push origin main
```

## Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

## Step 3: Add Vercel Postgres

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose a database name (e.g., `internal-crm-db`)
5. Select region (choose closest to your users)
6. Click **Create**

The `DATABASE_URL` environment variable will be automatically added to your project.

## Step 4: Deploy

Click **Deploy** button. Vercel will:
- Install dependencies
- Generate Prisma Client
- Build Next.js application
- Deploy to production

## Step 5: Run Database Migrations

After deployment, you need to set up the database schema:

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables (including DATABASE_URL)
vercel env pull .env.production

# Run migration using production DATABASE_URL
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) npx prisma migrate deploy
```

### Option B: Using Vercel Dashboard

1. Go to your project **Settings** → **Environment Variables**
2. Copy the `DATABASE_URL` value
3. Run locally:
```bash
DATABASE_URL="<paste-connection-string>" npx prisma migrate deploy
```

## Step 6: Seed Admin User and Packages

```bash
# Seed admin user
DATABASE_URL="<production-db-url>" npx tsx prisma/seed-admin.ts

# Seed packages (optional)
DATABASE_URL="<production-db-url>" npx tsx prisma/seed-packages.ts
```

**Default Admin Credentials:**
- Email: `admin@antigravity.com`
- Password: `Admin123!`

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

## Step 7: Verify Deployment

Visit your Vercel URL (e.g., `https://your-project.vercel.app`) and test:

1. **Registration**: Create a new user account
2. **Login as Admin**: Use admin credentials
3. **Approve User**: Go to `/admin/approvals` and approve the new user
4. **Login as User**: Verify approved user can access the app
5. **Packages**: Navigate to `/packages` and verify packages display
6. **Create Proposal**: Test proposal creation
7. **Download PDF**: Verify PDF download works

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `postinstall` script runs successfully

### Database Connection Error
- Verify `DATABASE_URL` is set in environment variables
- Check Vercel Postgres is active
- Ensure migrations have been run

### 500 Internal Server Error
- Check function logs in Vercel dashboard
- Verify Prisma Client is generated
- Check for missing environment variables

## Environment Variables Checklist

Required in Vercel:
- ✅ `DATABASE_URL` (automatically added by Vercel Postgres)

Optional (if you add features later):
- `NEXTAUTH_SECRET` (for NextAuth.js if you migrate to it)
- `NEXTAUTH_URL` (your production URL)

## Post-Deployment

1. **Change admin password**
2. **Create real user accounts**
3. **Add service packages**
4. **Configure custom domain** (optional)
5. **Set up monitoring** (Vercel Analytics)

## Rollback

If something goes wrong:
1. Go to Vercel dashboard → **Deployments**
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

---

**Need Help?**
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
