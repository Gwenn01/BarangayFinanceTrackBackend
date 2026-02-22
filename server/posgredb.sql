CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin','admin','encoder','checker','reviewer','approver')),
    full_name VARCHAR(150) NOT NULL,
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE budget_allocations (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    allocated_amount NUMERIC(14,2) NOT NULL,
    utilized_amount NUMERIC(14,2) DEFAULT 0.00,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budget_entries (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount NUMERIC(12,2) NOT NULL,
    fund_source VARCHAR(100),
    payee VARCHAR(150),
    dv_number VARCHAR(50),
    expenditure_program VARCHAR(150),
    program_description TEXT,
    remarks TEXT,
    allocation_id INTEGER,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (allocation_id) REFERENCES budget_allocations(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payor VARCHAR(150),
    nature_of_collection VARCHAR(150),
    description TEXT,
    fund_source VARCHAR(150),
    or_number VARCHAR(100),
    remarks TEXT,
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected')),
    is_flagged BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    review_comment TEXT,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE dfur_projects (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    name_of_collection VARCHAR(100),
    project VARCHAR(200) NOT NULL,
    location VARCHAR(150),
    total_cost_approved NUMERIC(14,2) NOT NULL,
    total_cost_incurred NUMERIC(14,2),
    date_started DATE,
    target_completion_date DATE,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned','in_progress','complete','on_hold','cancelled')),
    no_extensions INTEGER,
    remarks VARCHAR(200),
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected','completed')),
    is_flagged BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    review_comment TEXT,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE disbursements (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount NUMERIC(12,2) NOT NULL,
    payee VARCHAR(150),
    nature_of_disbursement VARCHAR(150),
    description TEXT,
    fund_source VARCHAR(150),
    or_number VARCHAR(100),
    remarks TEXT,
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected')),
    is_flagged BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    review_comment TEXT,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    allocation_id INTEGER,
    FOREIGN KEY (allocation_id) REFERENCES budget_allocations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE viewer_comments (
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

SELECT * FROM users;