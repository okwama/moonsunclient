# Digital Ocean App Platform Deployment Guide

## Prerequisites

1. **Digital Ocean Account** - Sign up at [digitalocean.com](https://digitalocean.com)
2. **GitHub Repository** - Your code should be in a GitHub repo
3. **Digital Ocean CLI** (optional) - For advanced deployment

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Digital Ocean deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 1.2 Update do-app.yaml
Edit the `do-app.yaml` file and replace:
- `your-username/your-repo` with your actual GitHub repository

## Step 2: Deploy via Digital Ocean Console

### 2.1 Create App
1. Go to [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Choose **"GitHub"** as source
4. Connect your GitHub account
5. Select your repository

### 2.2 Configure App Settings

**Build Command:**
```bash
npm install && npm run build
```

**Run Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

### 2.3 Environment Variables
Add these environment variables in the Digital Ocean console:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `http://64.226.66.235/api` |
| `VITE_PRODUCTION_API_URL` | `http://64.226.66.235/api` |
| `VITE_SOCKET_URL` | `http://64.226.66.235` |
| `VITE_APP_NAME` | `Retail Finance System` |
| `VITE_APP_VERSION` | `1.0.0` |

### 2.4 Instance Configuration
- **Instance Size:** Basic XXS (cheapest option)
- **Instance Count:** 1
- **Region:** Choose closest to your users

## Step 3: Deploy via CLI (Alternative)

### 3.1 Install Digital Ocean CLI
```bash
# Install doctl
# Windows: Download from https://github.com/digitalocean/doctl/releases
# Or use Chocolatey:
choco install doctl

# Authenticate
doctl auth init
```

### 3.2 Deploy App
```bash
# Deploy using the config file
doctl apps create --spec do-app.yaml

# Or deploy interactively
doctl apps create
```

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain
1. Go to your app in Digital Ocean console
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Update DNS records as instructed

### 4.2 SSL Certificate
- Digital Ocean automatically provides SSL certificates
- Your app will be accessible via HTTPS
- API calls will work through the proxy

## Step 5: Monitoring & Scaling

### 5.1 Monitor Performance
- Use Digital Ocean's built-in monitoring
- Check logs in the console
- Monitor resource usage

### 5.2 Scale if Needed
- Increase instance count for more traffic
- Upgrade instance size for better performance
- Enable auto-scaling for traffic spikes

## Benefits of Digital Ocean App Platform

✅ **Automatic SSL** - HTTPS certificates included  
✅ **Global CDN** - Fast loading worldwide  
✅ **Auto-scaling** - Handle traffic spikes  
✅ **Easy deployment** - Git-based deployments  
✅ **Built-in monitoring** - Performance insights  
✅ **Cost-effective** - Pay only for what you use  

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Digital Ocean console
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **API Connection Issues**
   - Verify environment variables are set correctly
   - Check that your API server is running
   - Test API endpoints directly

3. **Routing Issues**
   - Ensure React Router is configured correctly
   - Check that all routes serve index.html

### Useful Commands

```bash
# Check app status
doctl apps list

# View app logs
doctl apps logs <app-id>

# Update app
doctl apps update <app-id> --spec do-app.yaml

# Delete app
doctl apps delete <app-id>
```

## Cost Estimation

- **Basic XXS Instance:** ~$5/month
- **Custom Domain:** Free
- **SSL Certificate:** Free
- **Bandwidth:** Included in plan

Total estimated cost: **$5-10/month**

## Next Steps

1. **Deploy your app** following the steps above
2. **Test all functionality** - login, dashboard, features
3. **Set up monitoring** - alerts for downtime
4. **Configure backups** - if needed
5. **Set up CI/CD** - automatic deployments

Your app will be live at: `https://your-app-name.ondigitalocean.app` 