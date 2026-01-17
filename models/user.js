const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  userType: { type: String, enum: ['worker', 'contractor'], required: true },
  skill: { type: String },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }, // [longitude, latitude]
  },
  checkedIn: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);