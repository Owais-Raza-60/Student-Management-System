const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  teacher: {
    type: String,
    required: true
  },

  branch: String,

  description: String,

  progress: {
    type: Number,
    default: 0
  },

 image: String,

 resources: [
  {
    title: {
      type: String
    },

    type: {
      type: String
    },

    url: {
      type: String
    }
  }
]


}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);