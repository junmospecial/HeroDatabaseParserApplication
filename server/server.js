
const db = require('./config/db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 5000;  

const UserRouter = require('./routing/users');
const listsRouter = require('./routing/lists'); // adjust the path as necessary
const superheroesRouter = require('./routing/superheroes');

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000' // Allow only your React app to access the server
}));

// This line is crucial for parsing JSON bodies:
app.use(express.json());

// Use bodyParser
app.use(bodyParser.json());

// Use the routers
app.use('/lists', listsRouter);
app.use('/users', UserRouter);
app.use('/superheroes', superheroesRouter);

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
