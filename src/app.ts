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
import { create_cue_card, delete_cue_card, edit_cue_card, generate_cue_cards, get_cue_card_groups, get_cue_cards, get_cue_cards_by_group, get_cue_cards_by_user, grammarCheck, rewrite, summarize } from './routes/ai';
const crypto = require("crypto");
const session = require("express-session");
const port: any = process.env.PORT || 4000;
const secretKey = crypto.randomBytes(64).toString("hex");
dotenv.config();

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: ['http://157.230.72.123/', 'https://frontend.lim-e.com', 'https://www.frontend.lim-e.com','http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: ['http://157.230.72.123','https://frontend.lim-e.com', 'https://www.frontend.lim-e.com', 'http://localhost:3000'],
    credentials: true
  }
});

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

//AI + Cue Card routes 
app.post('/api/v1/cue-cards', create_cue_card)
app.post('/api/v1/generate-cue-cards', generate_cue_cards);
app.post('/api/v1/get-cue-cards', get_cue_cards);
app.post('/api/v1/cue-cards-by-group/:group_uuid', get_cue_cards_by_group);
app.post('/api/v1/cue-cards-by-user/:users', get_cue_cards_by_user);
app.post('/api/v1/cue-card-groups/:users', get_cue_card_groups);
app.put('/api/v1/cue-cards/:id', edit_cue_card);
app.delete('/api/v1/cue-cards/:id', delete_cue_card);

app.post('/api/v1/ai/summarize', summarize);
app.post('/api/v1/ai/rewrite', rewrite);
app.post('/api/v1/ai/grammar-check', grammarCheck);


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
