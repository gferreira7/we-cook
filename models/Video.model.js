const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const videoSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        reviews: [{
           /* id: { type: Schema.Types.ObjectId, ref: "Review" } */
           type: String

        }],
        description: {
            type: String,
            required: false,
        },
        tags: [String],
        views : {
            type:Number,
            // required: true,
        },
        likes : {
            type:Number,
            // required: true,
        },
        dislikes:{
            type:Number,
            // required: true,

        },
        recipe : [String],
        url: {
            type: String,
            required: true,
            trim: true,
        },
        owner: {
            /* id: { type: Schema.Types.ObjectId, ref: "User" } */
            type: String
         },

    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
);

const video = model("video", videoSchema);

module.exports = video;
