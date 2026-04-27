@echo off
echo Setting up GitHub Repository for Irembo Citizen Hub...
echo.

REM Create GitHub directory structure
echo 1. Creating repository structure...
mkdir backend 2>nul
mkdir frontend 2>nul
mkdir docs 2>nul
mkdir .github 2>nul
mkdir .github\workflows 2>nul

REM Move files to appropriate directories
echo 2. Organizing files...
move server.js backend\ >nul 2>&1
move package.json backend\ >nul 2>&1
move package-lock.json backend\ >nul 2>&1
move database_setup.sql backend\ >nul 2>&1
move .env.example backend\ >nul 2>&1
move front_end\index.html frontend\ >nul 2>&1
move README.md docs\ >nul 2>&1
move GITHUB_DEPLOYMENT.md docs\ >nul 2>&1

REM Create GitHub Actions workflow
echo 3. Creating GitHub Actions workflow...
echo name: Deploy Frontend > .github\workflows\deploy.yml
echo on: >> .github\workflows\deploy.yml
echo   push: >> .github\workflows\deploy.yml
echo     branches: [ main ] >> .github\workflows\deploy.yml
echo jobs: >> .github\workflows\deploy.yml
echo   deploy: >> .github\workflows\deploy.yml
echo     runs-on: ubuntu-latest >> .github\workflows\deploy.yml
echo     steps: >> .github\workflows\deploy.yml
echo       - uses: actions/checkout@v3 >> .github\workflows\deploy.yml
echo       - name: Setup Node.js >> .github\workflows\deploy.yml
echo         uses: actions/setup-node@v3 >> .github\workflows\deploy.yml
echo         with: >> .github\workflows\deploy.yml
echo           node-version: '18' >> .github\workflows\deploy.yml
echo       - name: Deploy to GitHub Pages >> .github\workflows\deploy.yml
echo         uses: peaceiris/actions-gh-pages@v3 >> .github\workflows\deploy.yml
echo         with: >> .github\workflows\deploy.yml
echo           github_token: ${{ secrets.GITHUB_TOKEN }} >> .github\workflows\deploy.yml
echo           publish_dir: ./frontend >> .github\workflows\deploy.yml

REM Create main README
echo 4. Creating main README.md...
echo # Irembo Citizen Hub > README.md
echo. >> README.md
echo A comprehensive digital services platform for Rwanda government services. >> README.md
echo. >> README.md
echo ## 🚀 Live Demo >> README.md
echo - **Frontend**: https://[username].github.io/irembo-citizen-hub >> README.md
echo - **Backend API**: https://your-backend-url.herokuapp.com >> README.md
echo. >> README.md
echo ## 📋 Features >> README.md
echo - User Authentication (JWT) >> README.md
echo - Service Requests & Payments >> README.md
echo - PDF Receipt Generation >> README.md
echo - Admin Dashboard & Analytics >> README.md
echo - Mobile Money Integration >> README.md
echo. >> README.md
echo ## 🛠️ Tech Stack >> README.md
echo - **Frontend**: HTML5, CSS3, JavaScript, Chart.js >> README.md
echo - **Backend**: Node.js, Express.js >> README.md
echo - **Database**: MySQL >> README.md
echo - **Authentication**: JWT >> README.md
echo - **Deployment**: GitHub Pages, Heroku >> README.md
echo. >> README.md
echo ## 📁 Repository Structure >> README.md
echo \`\`\` >> README.md
echo irembo-citizen-hub/ >> README.md
echo ├── backend/                # Node.js API server >> README.md
echo ├── frontend/               # Frontend application >> README.md
echo ├── docs/                   # Documentation >> README.md
echo └── .github/workflows/      # CI/CD pipelines >> README.md
echo \`\`\` >> README.md
echo. >> README.md
echo ## 🚀 Quick Start >> README.md
echo. >> README.md
echo ### Backend Setup >> README.md
echo 1. Clone repository >> README.md
echo 2. Navigate to backend directory >> README.md
echo 3. Install dependencies: \`npm install\` >> README.md
echo 4. Set up MySQL database >> README.md
echo 5. Configure environment variables >> README.md
echo 6. Start server: \`npm start\` >> README.md
echo. >> README.md
echo ### Frontend Access >> README.md
echo Frontend is automatically deployed via GitHub Pages. >> README.md
echo. >> README.md
echo ## 📖 Documentation >> README.md
echo See [docs/GITHUB_DEPLOYMENT.md](docs/GITHUB_DEPLOYMENT.md) for detailed deployment guide. >> README.md
echo. >> README.md
echo ## 🤝 Contributing >> README.md
echo 1. Fork the repository >> README.md
echo 2. Create feature branch >> README.md
echo 3. Commit changes >> README.md
echo 4. Push to branch >> README.md
echo 5. Create Pull Request >> README.md
echo. >> README.md
echo ## 📄 License >> README.md
echo This project is licensed under the MIT License. >> README.md

echo.
echo 5. Repository setup complete!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Run: git init
echo 3. Run: git add .
echo 4. Run: git commit -m "Initial commit"
echo 5. Run: git remote add origin https://github.com/username/irembo-citizen-hub.git
echo 6. Run: git push -u origin main
echo 7. Configure GitHub Pages in repository settings
echo.
pause
