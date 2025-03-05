import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from the .env file
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    ssl: {
        rejectUnauthorized: false,
        // ca: fs.readFileSync('/path/to/ca-certificate.crt').toString(),
    },
});

pool.connect()
    .then(() => console.log("Connected to the database"))
    .catch(err => console.error("Failed to connect to the database", err));

export default pool;
