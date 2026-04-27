const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1625630ely',
    database: process.env.DB_NAME || 'irembo_citizen_hub',
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'irembo_secret_key_2025';

// Email configuration (for demo, use ethereal.email)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'test@ethereal.email',
        pass: process.env.EMAIL_PASS || 'testpass'
    }
});

// ============ AUTHENTICATION ROUTES ============

// Register new user
app.post('/api/auth/register', [
    body('fullname').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3 }),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'user'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, username, password, role = 'user' } = req.body;

    try {
        // Check if user exists
        const [existing] = await db.promise().query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await db.promise().query(
            'INSERT INTO users (fullname, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
            [fullname, email, username, hashedPassword, role]
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
app.post('/api/auth/login', [
    body('username').notEmpty(),
    body('password').notEmpty()
], async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Admin middleware
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// ============ SERVICE ROUTES ============

// Get all available services
app.get('/api/services', authenticateToken, async (req, res) => {
    try {
        const [services] = await db.promise().query(
            'SELECT * FROM services WHERE is_active = TRUE'
        );
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services' });
    }
});

// Submit service request with payment
app.post('/api/service/submit', authenticateToken, [
    body('serviceId').notEmpty(),
    body('paymentMethod').isIn(['MTN MoMo', 'Airtel Money', 'Bank']),
    body('requestData').isObject()
], async (req, res) => {
    const { serviceId, paymentMethod, requestData } = req.body;
    const userId = req.user.id;

    try {
        // Get service details
        const [services] = await db.promise().query(
            'SELECT * FROM services WHERE service_id = ?',
            [serviceId]
        );

        if (services.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const service = services[0];
        const receiptId = `RCPT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // Start transaction
        await db.promise().beginTransaction();

        // Create transaction record
        const [txnResult] = await db.promise().query(
            `INSERT INTO transactions (receipt_id, user_id, user_name, service_id, service_name, amount, payment_method, status, payment_details)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Completed', ?)`,
            [receiptId, userId, req.user.username, serviceId, service.service_name, service.fee, paymentMethod, JSON.stringify(requestData)]
        );

        // Store service request details
        await db.promise().query(
            'INSERT INTO service_requests (transaction_id, request_data) VALUES (?, ?)',
            [txnResult.insertId, JSON.stringify(requestData)]
        );

        await db.promise().commit();

        // Generate PDF receipt
        const pdfBuffer = await generatePDFReceipt({
            receiptId,
            userName: req.user.username,
            serviceName: service.service_name,
            amount: service.fee,
            paymentMethod,
            requestData
        });

        // Send email confirmation
        await sendEmailReceipt(req.user.email, {
            receiptId,
            serviceName: service.service_name,
            amount: service.fee,
            requestData
        });

        res.json({
            success: true,
            message: 'Payment processed successfully',
            receiptId,
            amount: service.fee
        });

    } catch (error) {
        await db.promise().rollback();
        console.error(error);
        res.status(500).json({ message: 'Error processing request' });
    }
});

// Generate PDF receipt
async function generatePDFReceipt(data) {
    return new Promise((resolve) => {
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        doc.fontSize(20).text('IREMBO CITIZEN HUB', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text('OFFICIAL PAYMENT RECEIPT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10);
        doc.text(`Receipt Number: ${data.receiptId}`);
        doc.text(`Citizen Name: ${data.userName}`);
        doc.text(`Service: ${data.serviceName}`);
        doc.text(`Amount Paid: ${data.amount.toLocaleString()} RWF`);
        doc.text(`Payment Method: ${data.paymentMethod}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.moveDown();
        doc.text('Thank you for using our services!', { align: 'center' });
        doc.end();
    });
}

// Send email receipt
async function sendEmailReceipt(email, data) {
    const mailOptions = {
        from: 'no-reply@irembo.gov.rw',
        to: email,
        subject: `Payment Receipt - ${data.receiptId}`,
        html: `
            <h2>Payment Confirmation</h2>
            <p>Dear Citizen,</p>
            <p>Your payment has been successfully processed.</p>
            <p><strong>Receipt Number:</strong> ${data.receiptId}</p>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Amount:</strong> ${data.amount.toLocaleString()} RWF</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p>Thank you for using Irembo Citizen Services.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', email);
    } catch (error) {
        console.error('Email error:', error);
    }
}

// ============ ADMIN ROUTES ============

// Get all transactions (admin only)
app.get('/api/admin/transactions', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [transactions] = await db.promise().query(
            `SELECT t.*, u.email, u.fullname 
             FROM transactions t 
             JOIN users u ON t.user_id = u.id 
             ORDER BY t.transaction_date DESC 
             LIMIT 100`
        );
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Get analytics data (admin only)
app.get('/api/admin/analytics', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Total revenue
        const [revenue] = await db.promise().query(
            'SELECT SUM(amount) as total FROM transactions WHERE status = "Completed"'
        );
        
        // Revenue by service
        const [byService] = await db.promise().query(
            'SELECT service_name, SUM(amount) as total FROM transactions WHERE status = "Completed" GROUP BY service_name'
        );
        
        // Daily transactions
        const [daily] = await db.promise().query(
            'SELECT DATE(transaction_date) as date, COUNT(*) as count, SUM(amount) as total FROM transactions WHERE status = "Completed" GROUP BY DATE(transaction_date) ORDER BY date DESC LIMIT 7'
        );
        
        // Total users
        const [users] = await db.promise().query(
            'SELECT COUNT(*) as total FROM users'
        );

        res.json({
            totalRevenue: revenue[0].total || 0,
            revenueByService: byService,
            dailyStats: daily,
            totalUsers: users[0].total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

// Get user's own transactions
app.get('/api/user/transactions', authenticateToken, async (req, res) => {
    try {
        const [transactions] = await db.promise().query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC',
            [req.user.id]
        );
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user transactions' });
    }
});

// Get receipt by ID
app.get('/api/receipt/:receiptId', authenticateToken, async (req, res) => {
    const { receiptId } = req.params;
    
    try {
        const [receipts] = await db.promise().query(
            'SELECT * FROM transactions WHERE receipt_id = ? AND (user_id = ? OR ? IN (SELECT id FROM users WHERE role = "admin"))',
            [receiptId, req.user.id, req.user.id]
        );
        
        if (receipts.length === 0) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        
        const pdfBuffer = await generatePDFReceipt(receipts[0]);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt_${receiptId}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: 'Error generating receipt' });
    }
});

// Root route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Irembo Backend Server is running!',
        status: 'active',
        endpoints: {
            auth: '/api/auth/login, /api/auth/register',
            services: '/api/services',
            admin: '/api/admin/transactions, /api/admin/analytics'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});