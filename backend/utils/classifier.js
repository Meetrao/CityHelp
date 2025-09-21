const fetch = require('node-fetch');

exports.classify = async (text) => {
  const response = await fetch('https://api-inference.huggingface.co/models/Sayemkhan1111/civic-issue-classifier', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: text }),
  });

  const data = await response.json();
  return data[0]?.label || 'Uncategorized';
};
