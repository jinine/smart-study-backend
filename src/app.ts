import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import http from 'http'; // Import the 'http' module for creating a server
import { Server } from 'socket.io'; // Import the 'Server' from Socket.IO
import health_check from './routes/health';
import { create_user, get_user, update_password } from './routes/user';
import { login } from './routes/login';
import { create_document, delete_document, get_authorized_documents, get_document_by_uuid, get_documents, update_document } from './routes/document';
const crypto = require("crypto");
const session = require("express-session");
const port: any = process.env.PORT || 4000;
const secretKey = crypto.randomBytes(64).toString("hex");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:3000', credentials: true } });

const corsOptions = {
  origin: 'http://localhost:3000', 
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

// Routes 

// Health check routes
app.get('/api/v1/health', health_check);

// User routes
app.post('/api/v1/user/create_user', create_user);
app.post('/api/v1/user/get_user', get_user);
app.post('/api/v1/user/update_password', update_password);

// Auth routes
app.post('/api/v1/auth/login', login);

// Document routes
app.get('/api/v1/documents', get_documents);
app.post('/api/v1/authorized_documents', get_authorized_documents);
app.get('/api/v1/document/:uuid', get_document_by_uuid);
app.post('/api/v1/documents/create_document', create_document);
app.delete('/api/v1/documents/delete_document/:uuid', delete_document);
app.put('/api/v1/documents/update_document/:uuid', update_document);


io.on('connection', (socket) => {
  console.log("A user connected");

  socket.on('document-change', (documentUuid, newContent) => {
    console.log(`Document ${documentUuid} updated`);

    io.emit('document-update', documentUuid, newContent);
  });

  socket.on('disconnect', () => {
    console.log("A user disconnected");
  });
});

// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});
