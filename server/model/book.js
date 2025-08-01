import mongoose from "mongoose";
const Schema = mongoose.Schema

const bookSchema  = new Schema({
    name : String,
    genre:  String,
    authorId: String,
    cover: String, 
    url: String 
},
 { timestamps: true });

const Book = mongoose.model('Book', bookSchema)
export default Book;