const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'secret') {
    return res.json({ token: 'fake-jwt-token' });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
