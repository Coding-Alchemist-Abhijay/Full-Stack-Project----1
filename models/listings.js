const mongoose = require('mongoose');

const Schema_1 = new mongoose.Schema({
  title : {
    type : String, 
    required : true
  }, 
  description : {
    type : String,
  }, 
  image : {
        filename: {
            type : String,
        }, 
        url: {
    type : String,
    default: "https://images.unsplash.com/photo-1747767763480-a5b4c7a82aef?q=80&w=1204&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
  },
  price : {
    type : Number,
  },
  location : {
    type : String,
  },
  country : {
    type : String,
  }
})

const Listing = mongoose.model("listing", Schema_1);
module.exports = Listing