const fetch = require('node-fetch');

const token = 'your-valid-admin-token-here';

fetch('http://localhost:5000/api/admin/issues?status=Pending', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Issues:', data))
  .catch(err => console.error('Error:', err));
