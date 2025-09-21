const fetch = require('node-fetch');

// Simple keyword-based classifier as fallback
const classifyByKeywords = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('road') || lowerText.includes('street') || lowerText.includes('pothole') || lowerText.includes('traffic')) {
    return 'Infrastructure';
  }
  if (lowerText.includes('garbage') || lowerText.includes('trash') || lowerText.includes('waste') || lowerText.includes('dirty')) {
    return 'Environment';
  }
  if (lowerText.includes('light') || lowerText.includes('lamp') || lowerText.includes('dark') || lowerText.includes('illumination')) {
    return 'Infrastructure';
  }
  if (lowerText.includes('water') || lowerText.includes('leak') || lowerText.includes('pipe') || lowerText.includes('flood')) {
    return 'Infrastructure';
  }
  if (lowerText.includes('safety') || lowerText.includes('danger') || lowerText.includes('hazard') || lowerText.includes('unsafe')) {
    return 'Safety';
  }
  if (lowerText.includes('noise') || lowerText.includes('loud') || lowerText.includes('disturbance')) {
    return 'Environment';
  }
  
  return 'General';
};

exports.classify = async (text) => {
  // If no HF token is provided, use keyword-based classification
  if (!process.env.HF_TOKEN) {
    console.log('No HF_TOKEN found, using keyword-based classification');
    return classifyByKeywords(text);
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/Sayemkhan1111/civic-issue-classifier', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      console.log('Hugging Face API error, falling back to keyword classification');
      return classifyByKeywords(text);
    }

    const data = await response.json();
    return data[0]?.label || classifyByKeywords(text);
  } catch (error) {
    console.log('Error calling Hugging Face API, using keyword classification:', error.message);
    return classifyByKeywords(text);
  }
};
