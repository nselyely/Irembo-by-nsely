@echo off
echo Setting up MySQL database...
cd /d "%~dp0"
mysql -u root -p1625630ely < database_setup.sql
echo Database setup complete!
pause
