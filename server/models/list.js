const mongoose = require('mongoose');

const superheroListSchema = new mongoose.Schema({
  listName: {
    type: String,
    required: true,
    unique: true
  },
  superheroes: {
    type: [Number], // Array of superhero IDs
    default: []
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true // Assuming every list must have a userName associated with it
  },
  reviews: [{
    reviewerName: String,
    comment: String,  
    rating: Number, // Assuming a rating scale of 1-5
    hidden: {type: Boolean, default: false},
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });
const SuperheroList = mongoose.model('SuperheroList', superheroListSchema);

module.exports = SuperheroList;
