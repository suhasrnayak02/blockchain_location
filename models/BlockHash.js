const mongoose = require('mongoose');

const blockHashSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hashes: [{ type: String }], // Array to store multiple hashes per user
});

const BlockHash = mongoose.model('BlockHash', blockHashSchema);

module.exports = BlockHash;
