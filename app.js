const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const BlockHash = require('./models/BlockHash');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();

mongoose.connect('mongodb+srv://suhasrnayak:suhasrnayak@cluster0.fmrvofs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }
    if (password !== user.password) { // Check password directly without hashing
      return res.status(401).send('Invalid email or password');
    }
req.session.userId = user._id;
   res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/dashboard', (req, res) => {
  // Render the dashboard.ejs file and pass any necessary data
  res.render('dashboard');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }
    const newUser = new User({ email, password }); // Save password directly without hashing
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/storeBlockHash', async (req, res) => {
  try {
    const { blockHash } = req.body;
    const userId = req.session.userId; // Get user ID from session

    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await BlockHash.findOneAndUpdate(
      { user: userId },
      { $push: { hashes: blockHash } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Block hash stored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error storing block hash.' });
  }
});

// app.get('/hashes', async (req, res) => {
//   try {
//     const userId = req.session.userId;
//    console.log(userId);
//     if (!userId) {
//       return res.status(400).json({ error: 'User ID not provided' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid user ID format' });
//     }

//     const blockHashes = await BlockHash.findOne({ user: userId }).select('hashes');

//     if (!blockHashes) {
//       return res.status(404).json({ error: 'No hashes found for the user' });
//     }
//     res.json({ hashes: blockHashes.hashes });
//   } catch (error) {
//     console.error('Error retrieving hashes:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.get('/hashes', async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log(userId);

    let blockHashes;
    if (userId === '66277010e718e02dc6012e06') {
      // For the special user ID, fetch all hashes and their associated email IDs for all users
      blockHashes = await BlockHash.find().populate('user', 'email');
    } else {
      // For normal user IDs, fetch hashes associated with that particular user
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      blockHashes = await BlockHash.find({ user: userId }).populate('user', 'email');
    }

    if (!blockHashes) {
      return res.status(404).json({ error: 'No hashes found' });
    }

    const hashesWithEmail = blockHashes.map(blockHash => ({
      email: blockHash.user ? blockHash.user.email : '', // Retrieve email if user exists, otherwise set to empty string
      hashes: blockHash.hashes
    }));

    res.json(hashesWithEmail);
  } catch (error) {
    console.error('Error retrieving hashes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});