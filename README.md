# Express API Server with Socket.io and AI Routes

## Overview
This project is an Express-based API server that provides various endpoints for user management, authentication, document handling, AI-powered cue card generation, and real-time document updates using Socket.io.

## Features
- User authentication and management
- Document creation, retrieval, updating, and deletion
- AI-powered text processing (summarization, grammar checking, and rewriting)
- Cue card generation and management
- Real-time document updates with Socket.io
- Health check endpoint

## Technologies Used
- Node.js
- Express.js
- Socket.io
- dotenv for environment variables
- body-parser for request parsing
- express-session for session management
- CORS for cross-origin requests

## Prerequisites
- Node.js (>=16.x recommended)
- npm or yarn

## Installation
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd <project-directory>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and configure the necessary environment variables:
   ```sh
   PORT=4000
   ```

## Running the Server
Start the server using:
```sh
npm start
```
By default, the server will run on `http://localhost:4000`.

## API Endpoints
### Health Check
- `GET /api/v1/health` - Check server health

### User Management
- `POST /api/v1/user/create_user` - Create a new user
- `POST /api/v1/user/get_user` - Retrieve user details
- `POST /api/v1/user/update_password` - Update user password

### Authentication
- `POST /api/v1/auth/login` - Login to the system

### Document Management
- `GET /api/v1/documents` - Get all documents
- `POST /api/v1/authorized_documents` - Get authorized documents
- `GET /api/v1/document/:uuid` - Get a document by UUID
- `POST /api/v1/documents/create_document` - Create a new document
- `DELETE /api/v1/documents/delete_document/:uuid` - Delete a document
- `PUT /api/v1/documents/update_document/:uuid` - Update a document

### AI and Cue Cards
- `POST /api/v1/cue-cards` - Create a cue card
- `POST /api/v1/generate-cue-cards` - Generate cue cards
- `POST /api/v1/get-cue-cards` - Retrieve cue cards
- `POST /api/v1/cue-cards-by-group/:group_uuid` - Get cue cards by group
- `POST /api/v1/cue-cards-by-user/:users` - Get cue cards by user
- `POST /api/v1/cue-card-groups/:users` - Get cue card groups
- `PUT /api/v1/cue-cards/:id` - Edit a cue card
- `DELETE /api/v1/cue-cards/:id` - Delete a cue card
- `POST /api/v1/ai/summarize` - Summarize text
- `POST /api/v1/ai/rewrite` - Rewrite text
- `POST /api/v1/ai/grammar-check` - Perform grammar check

### Real-Time Features (Socket.io)
- Listens for `document-change` events and broadcasts updates
- Emits `document-update` when a document is modified

## Deployment
For production deployment:
```sh
NODE_ENV=production npm start
```
Ensure proper CORS settings and security measures are in place.

## Author
[Tristan Engen]

