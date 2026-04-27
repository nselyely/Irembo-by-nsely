const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Debugging server startup issues...\n');

// Test 1: Check environment variables
console.log('1. Environment Variables:');
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('   DB_NAME:', process.env.DB_NAME);
console.log('   PORT:', process.env.PORT);

// Test 2: Test database connection
console.log('\n2. Testing Database Connection...');
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'irembo_citizen_hub',
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:');
        console.error('   Error code:', err.code);
        console.error('   Error message:', err.message);
        
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Solution: Check MySQL username/password');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('\n💡 Solution: Database does not exist. Run setup_database.bat');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('\n💡 Solution: MySQL server is not running');
        }
        
        process.exit(1);
    } else {
        console.log('✅ Database connection successful!');
        
        // Test 3: Check if tables exist
        console.log('\n3. Checking Database Tables...');
        db.query('SHOW TABLES', (err, results) => {
            if (err) {
                console.error('❌ Error checking tables:', err.message);
            } else {
                console.log('✅ Tables found:', results.length);
                results.forEach(row => {
                    console.log('   -', Object.values(row)[0]);
                });
                
                if (results.length === 0) {
                    console.log('\n💡 Solution: Run setup_database.bat to create tables');
                }
            }
            
            db.end();
            console.log('\n🎯 If all tests pass, try running: node server.js');
        });
    }
});
