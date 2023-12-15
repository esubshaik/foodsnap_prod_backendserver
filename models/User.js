const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    age :{
      type: String,
    },
    height :{
      type: String,
    },
    weight: {
      type: String,
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
UserSchema.virtual("nutrientries", {
  ref: "nutrientry",
  localField: "_id",
  foreignField: "user",
});

UserSchema.virtual("hydrateentries", {
  ref: "hydrate",
  localField: "_id",
  foreignField: "user",
});


module.exports = mongoose.model("User", UserSchema);
