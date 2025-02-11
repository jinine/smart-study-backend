import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import health_check from './routes/health';
import { create_user, get_user, update_password } from './routes/user';
import { login } from './routes/login';
import { create_document, delete_document, get_document_by_uuid, get_documents, update_document } from './routes/document';
const crypto = require("crypto");
const session = require("express-session");
const port: any = process.env.PORT || 8991;
const secretKey = crypto.randomBytes(64).toString("hex");
dotenv.config();

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  })
);

//routes 

//health check routes
app.get('/api/v1/health', health_check);

//user routes
app.post('/api/v1/user/create_user', create_user);
app.post('/api/v1/user/get_user', get_user);
app.post('/api/v1/user/update_password', update_password);

//auth routes
app.post('/api/v1/auth/login', login);

//document routes 
app.get('/api/v1/documents', get_documents);
app.get('/api/v1/document/:uuid', get_document_by_uuid);
app.post('/api/v1/documents/create_document', create_document);
app.delete('/api/v1/documents/delete_document/:uuid', delete_document);
app.put('/api/v1/documents/update_document/:uuid', update_document);

// Start the server
app.listen(8991, '0.0.0.0', () => {
  console.log(`Server started on port ${8991}`);
});