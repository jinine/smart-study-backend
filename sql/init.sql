CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    encrypted_pass TEXT NOT NULL,
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_type TEXT CHECK (access_type IN ('public', 'restricted')),
    users VARCHAR(255) NOT NULL,
    content TEXT
);

CREATE TABLE cue_cards (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    access_type TEXT CHECK (access_type IN ('public', 'restricted')),
    users VARCHAR(255) NOT NULL, 
    group_uuid TEXT NOT NULL 
);