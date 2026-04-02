const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minLength: [2, "First name must be atleast 2 characters"],
      maxLength: [35, "First name cannot be more than 35 characters"],
      // validate: {
      //   validator: (value) => /^[a-zA-Z]*$/.test(value),
      //   message: "First name must consist of alphabets only"
      // }
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      minLength: 0,
      maxLength: [35, "Last name cannot be more than 35 characters"],
      validate: {
        validator: (value) => /^[a-zA-Z]*$/.test(value),
        message: "Last name must consist of alphabets only"
      }
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "This email address is already in use"],
      trim: true,
      lowercase: true,
      maxLength: [350, "Email address cannot be more than 350 characters long"],
      validate: {
        validator: validator.isEmail,
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: [13, "You must be atleast 13 years of age to sign up"],
      max: [150, "Age cannot be more than 150 years"],
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not a valid age",
      },
    },
    gender: {
      type: String,
      lowercase: true,
      trim: true,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender type. Valid gender types are- male, female, other`,
      },
    },
    photoUrl: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
      maxLength: [1000, "Photo URL cannot be more than 1000 characters long"],
      validate(value) {
        if (value.length > 0 && !validator.isURL(value)) {
          throw new Error("Invalid Photo URL");
        }
      },
    },
    about: {
      type: String,
      default: "This is a default about of the user!",
      trim: true,
      maxLength: [200, "About description cannot be of more than 200 characters"],
    },
    skills: {
      type: [
        {
          type: String,
          minLength: [1, "Length of skill must be atleast 1 character"],
          maxLength: [25, "Length of each skill cannot be more than 25 characters"],
          trim: true,
        }
      ],
      validate: [
        {
          validator: (val) => val.length <= 25,
          message: "You cannot put more than 25 skills"
        },
        {
          validator: (val) => new Set(val).size === val.length,
          message: "Skills must be unique"
        }
      ]
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "30d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);