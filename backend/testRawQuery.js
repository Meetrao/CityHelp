const mongoose = require('mongoose');
const Issue = require('./models/Issue');

mongoose.connect('mongodb+srv://cityhelp_ai:11223344@cityhelp-cluster.x8elial.mongodb.net/?retryWrites=true&w=majority&appName=cityhelp-cluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

(async () => {
  try {
    const issues = await Issue.find({ status: { $regex: /^Pending$/i } });
    console.log('Matched issues:', issues.length);
    console.log(issues.map(i => i.title));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
})();
