const mongoose = require("mongoose");
const nutriSchema = new mongoose.Schema(
    {
      foodname : {
        type: String
      },
        nutridata: {
          type: [String],
          required: [true, "Data is required"],
    },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
      {
        timestamps: true,
      }
    );
    
module.exports = mongoose.model("nutrientry", nutriSchema);
    