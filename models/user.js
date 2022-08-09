const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        // Credentials
        email: {
            type: String,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
            unique: true,
            required: true,
        },
        password: {type: String, required: true},

        // Informations
        firstname: {type: String, required: true},
        lastname: {type: String, required: true},
        gender: {
            type: String, enum: {
                values: ['Male', 'Female'],
                message: '{VALUE} is not supported'
            }
        },
        birthdate: {type: Date, required: true},
        bio: {type: String, default: ""},
        city: {type: String},
        region: {type: String},

        Marksheet: [
            {        
              idbook: {
                type: String,
              },nbpage:{
                type: Number,
              },titre:{
                type: String,

              }
          
            },
          ],


        // Other
        isVerified: {type: Boolean, default: true},
        pictureId: {type: String},

        // Relations
        favoriteBooks: [{type: mongoose.Schema.Types.ObjectId, ref: "Book"}],
        favoriteAudiobooks: [{type: mongoose.Schema.Types.ObjectId, ref: "Audiobook"}],
        followers: {type: Array, default: []},
        followings: {type: Array, default: []},
    },
    {
        timestamps: {currentTime: () => Date.now()},
    }
);


module.exports = mongoose.model("User", UserSchema);
