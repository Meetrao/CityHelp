exports.login = (req, res) => {
    const { username, password } = req.body;
  
    if (username === 'admin' && password === 'secret') {
      return res.json({ token: 'fake-jwt-token' });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  };
  