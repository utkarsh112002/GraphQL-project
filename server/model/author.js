import mongoose from "mongoose";

const authorSchema  = new mongoose.Schema({
    name:  String,
    age: Number
});

const Author = mongoose.model("author",authorSchema)
export default Author