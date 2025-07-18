# 🚀 Deployment Guide for Render

## ⚡ Quick Deployment (Start Here)

### Pre-Deployment Checklist

- [x] All API methods working
- [x] Package.json files configured
- [x] render.yaml created
- [x] Environment variables ready

### Quick Steps (5 minutes)

1. **Push to GitHub**: `git add . && git commit -m "Ready for deployment" && git push`
2. **Go to Render**: [render.com](https://render.com) → Sign up with GitHub
3. **Deploy**: Click "New +" → "Blueprint" → Connect repository → "Apply"
4. **Set Variables**: Add `DATABASE_URL` and `JWT_SECRET` to backend
5. **Create DB**: "New +" → "PostgreSQL" → Free plan → Copy connection string

### Expected URLs

- **Frontend**: `https://loan-recovery-frontend.onrender.com`
- **Backend**: `https://loan-recovery-backend.onrender.com`

---

## 📖 Comprehensive Guide

### Overview

This guide will help you deploy your Loan Recovery System to Render without Docker. The application consists of:

- **Backend**: Node.js/Express API
- **Frontend**: React/Vite application
- **Database**: PostgreSQL (provided by Render)

### Prerequisites

1. Render account (free tier available)
2. GitHub repository with your code
3. PostgreSQL database (Render provides this)

### Deployment Options

#### Option 1: Automatic Deployment (Recommended)

Use the `render.yaml` file for automatic deployment:

1. **Push your code to GitHub**
2. **Connect to Render**:

   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**:
   - Set `DATABASE_URL` (Render will provide this)
   - Set `JWT_SECRET` (generate a secure random string)

#### Option 2: Manual Deployment

##### Step 1: Deploy Backend

1. **Create Web Service**:

   - Name: `loan-recovery-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=<your-secret-key>
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

##### Step 2: Deploy Frontend

1. **Create Static Site**:

   - Name: `loan-recovery-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

### Database Setup

#### Option 1: Render PostgreSQL (Recommended)

1. **Create PostgreSQL Database**:

   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Choose plan (Free tier available)
   - Copy the connection string

2. **Set Environment Variable**:
   - Add `DATABASE_URL` to your backend service
   - Format: `postgresql://user:password@host:port/database`

#### Option 2: External Database

- Use any PostgreSQL provider (AWS RDS, DigitalOcean, etc.)
- Set the `DATABASE_URL` environment variable

### Configuration

#### Backend Configuration

The backend is already configured for production:

- ✅ Environment variables support
- ✅ CORS configuration
- ✅ Database connection
- ✅ JWT authentication

#### Frontend Configuration

The frontend is configured to:

- ✅ Use environment variables for API URL
- ✅ Build optimized for production
- ✅ Handle different environments

### Environment Variables

#### Backend Variables

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

#### Frontend Variables

```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

#### Generate JWT Secret

```bash
# Use this command to generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Troubleshooting

#### Common Issues

1. **Build Fails**:

   - Check Node.js version (requires >=16)
   - Verify all dependencies are in `package.json`

2. **Database Connection**:

   - Verify `DATABASE_URL` is correct
   - Check if database is accessible

3. **CORS Errors**:

   - Ensure `CORS_ORIGIN` matches your frontend URL
   - Check if backend URL is correct in frontend

4. **Environment Variables**:
   - Verify all required variables are set
   - Check variable names (case-sensitive)

#### Debugging

- Check Render logs in the dashboard
- Use `console.log` for debugging (will appear in logs)
- Test API endpoints using the Render URL

### Monitoring

#### Render Dashboard

- View real-time logs
- Monitor resource usage
- Check deployment status
- View environment variables

#### Health Checks

- Backend: `https://your-backend.onrender.com/health`
- Frontend: Your main application URL

### Updates

#### Automatic Updates

- Render automatically redeploys when you push to GitHub
- No manual intervention required

#### Manual Updates

- Push changes to GitHub
- Render will detect changes and redeploy
- Monitor deployment in dashboard

### Cost Optimization

#### Free Tier Limits

- **Backend**: 750 hours/month (sleeps after 15 min inactivity)
- **Frontend**: Unlimited (static hosting)
- **Database**: 90 days free trial

#### Paid Plans

- **Backend**: $7/month for always-on service
- **Database**: $7/month for persistent storage

### Deployment Timeline

- **Backend**: 5-10 minutes
- **Frontend**: 3-5 minutes
- **Database**: 2-3 minutes
- **Total**: ~10-15 minutes

### Success Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and working
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] Application fully functional

### Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Render Support**: Available in dashboard
- **Community**: Render Discord/Forums

---

**Note**: This deployment guide assumes you're using the free tier. For production applications, consider upgrading to paid plans for better performance and reliability.
