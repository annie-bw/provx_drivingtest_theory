-- ===========================================
-- CREATE ADMIN USER FOR DRIVING TEST API
-- ===========================================
--
-- Run this SQL in your PostgreSQL database
-- to create an admin user for testing admin endpoints
--
-- Login credentials:
-- Email: admin@example.com
-- Password: AdminPass123
--
-- The password hash is bcrypt encoded for "AdminPass123"
-- ===========================================

INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Admin',
    'User',
    'admin@example.com',
    '$2b$12$ctWonPVVSAjSU2FSIzAV9.U4lZWh3LkgBNwdhMoLpM4SgV.lAoVZq',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- Verify the user was created
SELECT id, first_name, last_name, email, role, is_active
FROM users
WHERE email = 'admin@example.com';

-- ===========================================
-- INSTRUCTIONS:
-- 1. Connect to your PostgreSQL database
-- 2. Run the INSERT statement above
-- 3. Use Postman to login with:
--    POST /api/auth/login
--    {
--      "email": "admin@example.com",
--      "password": "AdminPass123"
--    }
-- 4. Copy the token from response
-- 5. Set {{admin_token}} in Postman environment
-- 6. Now you can test admin endpoints!
-- ===========================================
