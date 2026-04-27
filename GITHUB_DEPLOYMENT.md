# GitHub Deployment Guide

## Overview
This guide explains how to deploy the Irembo Citizen Hub application on GitHub.

## Repository Structure
```
irembo-citizen-hub/
├── backend/                 # Node.js backend server
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── database_setup.sql
├── frontend/               # Frontend for GitHub Pages
│   └── index.html
├── docs/                   # Documentation
├── .gitignore
├── README.md
└── deploy.yml             # GitHub Actions workflow
```

## Frontend Deployment (GitHub Pages)

### Step 1: Prepare Frontend for GitHub Pages
1. Move frontend files to a `docs` or `frontend` folder
2. Update API base URL in frontend to use deployed backend
3. Configure GitHub Pages in repository settings

### Step 2: GitHub Actions Deployment
Create `.github/workflows/deploy.yml` for automatic deployment.

### Step 3: Configure GitHub Pages
1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` or `main/docs`
4. Folder: `/docs` or `/root`

## Backend Deployment Options

### Option 1: Heroku (Recommended)
1. Create Heroku account
2. Install Heroku CLI
3. Deploy using Git:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

### Option 2: Vercel
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Automatic deployment on push

### Option 3: Railway
1. Sign up for Railway
2. Import GitHub repository
3. Configure database and environment

### Option 4: DigitalOcean App Platform
1. Create DigitalOcean account
2. Connect GitHub repository
3. Configure app specifications

## Database Setup

### Option 1: PlanetScale (MySQL)
1. Create PlanetScale account
2. Create database
3. Get connection string
4. Update environment variables

### Option 2: Railway MySQL
1. Use Railway's built-in MySQL
2. Get connection details
3. Configure in backend

### Option 3: Supabase
1. Create Supabase project
2. Use PostgreSQL (modify queries)
3. Get connection string

## Environment Variables

### Backend Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=irembo_citizen_hub
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
```

### Frontend Configuration
Update API base URL in frontend:
```javascript
const API_BASE_URL = 'https://your-backend-url.herokuapp.com/api';
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Security**: Use SSL connections
3. **API Security**: Implement rate limiting
4. **Authentication**: Secure JWT secrets
5. **CORS**: Configure allowed origins

## Domain Configuration

### Custom Domain for Frontend
1. Go to GitHub repository Settings → Pages
2. Add custom domain
3. Configure DNS records

### Backend API Domain
Configure custom domain based on hosting provider:

**Heroku**: 
```bash
heroku domains:add your-api.yourdomain.com
```

**Vercel**: Configure in dashboard

## CI/CD Pipeline

### GitHub Actions Workflow
- **Test**: Run tests on pull requests
- **Build**: Build frontend assets
- **Deploy**: Deploy to staging/production
- **Database Migration**: Run database migrations

### Example Workflow
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: ${{secrets.HEROKU_APP_NAME}}
          heroku_email: ${{secrets.HEROKU_EMAIL}}
```

## Monitoring and Maintenance

### Logging
- Use Winston or Morgan for logging
- Configure log levels
- Set up log aggregation

### Health Checks
- Implement `/health` endpoint
- Monitor database connectivity
- Check external service status

### Backup Strategy
- Database backups (daily/weekly)
- Code repository backups
- Configuration backups

## Performance Optimization

### Frontend
- Minify CSS/JS
- Optimize images
- Use CDN for assets
- Implement caching

### Backend
- Database indexing
- API response caching
- Connection pooling
- Load balancing

## Troubleshooting

### Common Issues
1. **CORS Errors**: Configure allowed origins
2. **Database Connection**: Check credentials
3. **Environment Variables**: Verify all required vars
4. **Build Failures**: Check dependency versions

### Debugging Tools
- Browser Developer Tools
- Server logs
- Database query logs
- API testing tools (Postman/Insomnia)
