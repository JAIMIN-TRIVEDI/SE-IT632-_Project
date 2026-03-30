import mongoose from "mongoose";

const messMenuSchema = new mongoose.Schema({

  weekStart:{
    type:Date,
    required:true
  },

  menu:{
    monday:{
      breakfast:String,
      lunch:String,
      dinner:String
    },
    tuesday:{
      breakfast:String,
      lunch:String,
      dinner:String
    },
    wednesday:{
      breakfast:String,
      lunch:String,
      dinner:String
    },
    thursday:{
      breakfast:String,
      lunch:String,
      dinner:String
    },
    friday:{
      breakfast:String,
      lunch:String,
      dinner:String
    },
    saturday:{
      breakfast:String,
      lunch:String,
      dinner:String
    },
    sunday:{
      breakfast:String,
      lunch:String,
      dinner:String
    }

  }

},{timestamps:true});

export default mongoose.model("MessMenu",messMenuSchema);