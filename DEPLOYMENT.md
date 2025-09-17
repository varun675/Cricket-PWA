# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy your Cricket PWA to GitHub Pages with automatic redeployment on every commit.

## 📋 Prerequisites

1. A GitHub account
2. Git installed on your machine
3. Your project pushed to a GitHub repository

## 🔧 Setup Steps

### Step 1: Push Your Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: Cricket PWA"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/Cricket-PWA.git

# Push to GitHub
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### Step 3: Configure Repository Permissions

1. In your repository, go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

### Step 4: Update Repository Name (Important!)

Make sure your repository name matches the base path in `vite.config.ts`. Currently set to `/Cricket-PWA/`.

If your repository has a different name, update line 27 in `vite.config.ts`:

```typescript
base: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '/',
```

## 🎯 Automatic Deployment

Once set up, the deployment will happen automatically:

### ✅ What Triggers Deployment:
- Any push to `main` or `master` branch
- Any pull request to `main` or `master` branch

### 🔄 Deployment Process:
1. GitHub Actions detects your commit
2. Installs Node.js and dependencies
3. Builds your React app with `npm run build:client`
4. Deploys to GitHub Pages
5. Your site is live at: `https://YOUR_USERNAME.github.io/Cricket-PWA/`

## 📁 Files Created for Deployment

I've created the following files for you:

1. **`.github/workflows/deploy.yml`** - GitHub Actions workflow
2. **`client/public/.nojekyll`** - Ensures GitHub Pages serves your files correctly
3. **Updated `vite.config.ts`** - Configured for GitHub Pages
4. **Updated `package.json`** - Added production build script

## 🏏 Your Cricket PWA Features

Your deployed PWA will include:

- ✅ **Offline Support** - Works without internet
- ✅ **Service Worker** - Caches resources for fast loading
- ✅ **PWA Manifest** - Can be installed on devices
- ✅ **Push Notifications** - Ready for cricket updates
- ✅ **Responsive Design** - Works on all devices

## 🔍 Monitoring Deployments

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You'll see all deployment runs
4. Click on any run to see detailed logs

## 🐛 Troubleshooting

### Common Issues:

1. **404 Error**: Check if repository name matches the base path in `vite.config.ts`
2. **Build Fails**: Check the Actions tab for error logs
3. **Assets Not Loading**: Ensure all paths are relative in your code

### Quick Fixes:

```bash
# Test build locally
npm run build:client

# Check if build folder is created
ls -la client/dist/
```

## 🎉 Success!

Once deployed, your Cricket PWA will be available at:
`https://YOUR_USERNAME.github.io/Cricket-PWA/`

Every time you commit changes to the main branch, your site will automatically update within 2-3 minutes!

---

**Happy Coding! 🏏✨**
