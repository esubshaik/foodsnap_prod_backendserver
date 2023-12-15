const mongoose = require("mongoose");
const hydrateSchema = new mongoose.Schema(
    {
        hydrate: {
          type: String,
          required: [true, "water quantity is required"],
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
    
module.exports = mongoose.model("hydrate", hydrateSchema);
    