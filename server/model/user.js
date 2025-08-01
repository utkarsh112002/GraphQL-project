import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter your Username"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter Password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["Candidate", "Admin"],
      default: "Candidate",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
