import _ from "lodash";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import Book from "../model/book.js";
import Author from "../model/author.js";
// dummy data
var books = [
    { name: 'Name of the Wind', genre: 'Fantasy', id: '1', authorId: '1' },
    { name: 'The Final Empire', genre: 'Fantasy', id: '2', authorId: '2' },
    { name: 'The Hero of Ages', genre: 'Fantasy', id: '4', authorId: '2' },
    { name: 'The Long Earth', genre: 'Sci-Fi', id: '3', authorId: '3' },
    { name: 'The Colour of Magic', genre: 'Fantasy', id: '5', authorId: '3' },
    { name: 'The Light Fantastic', genre: 'Fantasy', id: '6', authorId: '3' },
];

var authors = [
  { name: "Patrick Rothfuss", age: 44, id: "1" },
  { name: "Brandon Sanderson", age: 42, id: "2" },
  { name: "Terry Pratchett", age: 66, id: "3" },
];

const BookType = new GraphQLObjectType({
  //Schema for Book
  name: "Book",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        console.log(parent);
        // return _.find(authors, { id: parent.authorId });
        return Author.findById(parent.authorId)
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  //Schema for Book
  name: "Author",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
        type: new GraphQLList(BookType),
        resolve(parent,args){
            // return _.filter(books, {authorId : parent.id})
            return Book.find({authorId:parent.id})
        }
    }
  }),
});
// RootQuery for perticular book, for Author, multiple books
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: {
      type: BookType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        //code to get data from db
        // return _.find(books, { id: args.id });
        return Book.findById(args.id)
      },
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        // return _.find(authors, { id: args.id });
        return Author.findById(args.id)
      },
    },

    books:{
        type: new GraphQLList(BookType),
        resolve(parent, args){
            // return books
            return Book.find({})
        }
    },
    authors: {
        type: new GraphQLList(AuthorType),
        resolve(parent, args){
            // return authors
            return Author.find({})
        }
    }
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: {type: new GraphQLNonNull(GraphQLString)},
        age: {type:  new GraphQLNonNull(GraphQLInt)}
      },
      resolve(parent,args){
        let author  = new Author({

          name: args.name,
          age: args.age
        });
        return author.save()
      }
    },
    addBook: {
      type: BookType,
      args: {
        name: {type: new GraphQLNonNull(GraphQLString)},
        genre: {type: new GraphQLNonNull(GraphQLString)},
        authorId: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve(parent, args){
        let book = new Book({
          name: args.name,
          genre: args.genre,
          authorId: args.authorId
        });
        return book.save()
      }
    }
  }
}) 

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
