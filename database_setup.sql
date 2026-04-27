-- Create database if not exists
CREATE DATABASE IF NOT EXISTS irembo_citizen_hub;
USE irembo_citizen_hub;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    service_description TEXT,
    fee DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    icon_name VARCHAR(100),
    form_fields JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    service_id INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('MTN MoMo', 'Airtel Money', 'Bank') NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Completed',
    payment_details JSON,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(service_id)
);

-- Service requests table (for detailed form data)
CREATE TABLE IF NOT EXISTS service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    request_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Insert sample services
INSERT INTO services (service_name, service_description, fee, icon_name, form_fields) VALUES
('Pay Mituelli (Contribution)', 'Monthly contribution payment', 5000.00, 'fas fa-hand-holding-usd', '[{"name":"period","label":"Period (Month)","type":"text","placeholder":"e.g., January 2025"}]'),
('School Fees Payment', 'Educational institution fees', 25000.00, 'fas fa-graduation-cap', '[{"name":"school","label":"School Name","type":"text"},{"name":"studentId","label":"Student ID","type":"text"}]'),
('Land Registration (SER of Land)', 'Land registration and title services', 10000.00, 'fas fa-map-marked-alt', '[{"name":"plotNumber","label":"Plot Number","type":"text"},{"name":"province","label":"Province","type":"text"}]'),
('Ndashakaukora - Rewrite Children (Umurage)', 'Child birth certificate rewriting', 3000.00, 'fas fa-child', '[{"name":"childName","label":"Child Full Name","type":"text"},{"name":"birthCert","label":"Birth Certificate No","type":"text"}]'),
('Social Security (Umurage w''abana / Mutuelle)', 'Social security and health insurance', 7000.00, 'fas fa-shield-alt', '[{"name":"familyHead","label":"Family Head Name","type":"text"},{"name":"members","label":"Number of Dependents","type":"number"}]'),
('Umutekano (Security Contribution)', 'Security services contribution', 4500.00, 'fas fa-lock', '[{"name":"serviceType","label":"Security Service Type","type":"text"}]');

-- Insert default admin user (password: admin123 hashed)
INSERT INTO users (fullname, email, username, password, role) VALUES 
('Admin Irembo', 'admin@irembo.rw', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Insert default user (password: user123 hashed)
INSERT INTO users (fullname, email, username, password, role) VALUES 
('Jean Pierre', 'jean@example.com', 'user', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON DUPLICATE KEY UPDATE username = username;
