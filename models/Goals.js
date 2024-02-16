const mongoose = require("mongoose");
const GoalsSchema = new mongoose.Schema(
    {
        goal: {
            type: String
        },
        activity: {
            type: String
        },
        variation: {
            type: Number
        },
        days: {
            type: Number 
        },
        target: {
            type: Number 
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

module.exports = mongoose.model("goalsentry", GoalsSchema);
