import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLBoolean,
} from "graphql";
import bcrypt from "bcryptjs";
import User from "../model/user.js";
import Book from "../model/book.js";
import Author from "../model/author.js";
import { generateToken } from "../utils/jwt.js";

// ========== USER TYPE ==========
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
  }),
});

// ========== AUTHOR TYPE ==========
const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent) {
        return Book.find({ authorId: parent.id });
      },
    },
  }),
});

// ========== BOOK TYPE ==========
const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    cover: { type: GraphQLString },
    url: { type: GraphQLString },
    isFavorite: { type: GraphQLBoolean }, // New field
    author: {
      type: AuthorType,
      resolve(parent) {
        return Author.findById(parent.authorId);
      },
    },
  }),
});

// ========== ROOT QUERY ==========
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    books: {
      type: new GraphQLList(BookType),
      args: {
        search: { type: GraphQLString },
        sortBy: { type: GraphQLString },
        isFavorite: { type: GraphQLBoolean }, // New filter
      },
      async resolve(parent, args) {
        const query = {};

        if (args.search) {
          const authors = await Author.find({
            name: { $regex: args.search, $options: "i" },
          });

          const authorIds = authors.map((a) => a.id);

          query.$or = [
            { name: { $regex: args.search, $options: "i" } },
            { authorId: { $in: authorIds } },
          ];
        }

        if (typeof args.isFavorite === "boolean") {
          query.isFavorite = args.isFavorite;
        }

        const sortOrder = args.sortBy === "oldest" ? 1 : -1;
        return Book.find(query).sort({ createdAt: sortOrder });
      },
    },

    book: {
      type: BookType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Book.findById(args.id);
      },
    },

    authors: {
      type: new GraphQLList(AuthorType),
      resolve() {
        return Author.find({});
      },
    },

    author: {
      type: AuthorType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Author.findById(args.id);
      },
    },

    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args, context) {
        if (!context.user || context.user.role !== "Admin") {
          throw new Error("Unauthorized");
        }
        return User.find({});
      },
    },

    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args, context) {
        if (!context.user || context.user.role !== "Admin") {
          throw new Error("Unauthorized");
        }
        return User.findById(args.id);
      },
    },
  },
});

// ========== MUTATIONS ==========
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    registerUser: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const existing = await User.findOne({ email: args.email });
        if (existing) throw new Error("Email already registered");

        const hashedPassword = await bcrypt.hash(args.password, 10);
        const user = new User({
          username: args.username,
          email: args.email,
          password: hashedPassword,
          role: args.role,
        });
        return user.save();
      },
    },

    loginUser: {
      type: GraphQLString,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const user = await User.findOne({ email: args.email });
        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(args.password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        return generateToken(user);
      },
    },

    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        const author = new Author({
          name: args.name,
          age: args.age,
        });
        return author.save();
      },
    },

    addBook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
        cover: { type: GraphQLString },
        url: { type: GraphQLString },
        isFavorite: { type: GraphQLBoolean }, // New input
      },
      resolve(parent, args) {
        const book = new Book({
          name: args.name,
          genre: args.genre,
          authorId: args.authorId,
          cover: args.cover,
          url: args.url,
          isFavorite: args.isFavorite || false,
        });
        return book.save();
      },
    },

    updateBook: {
  type: BookType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    authorId: { type: GraphQLString },
    cover: { type: GraphQLString },
    url: { type: GraphQLString },
    isFavorite: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    // Optional: restrict to Admin
    if (!context.user || context.user.role !== "Admin") {
      throw new Error("Unauthorized");
    }

    const updateData = { ...args };
    delete updateData.id; // Don't include id in update
    return Book.findByIdAndUpdate(args.id, updateData, { new: true });
  },
},

deleteBook: {
  type: BookType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
  },
  async resolve(parent, { id }, context) {
    if (!context.user || context.user.role !== "Admin") {
      throw new Error("Unauthorized");
    }

    return Book.findByIdAndDelete(id);
  },
},
    toggleFavorite: {
      type: BookType,
      args: {
        bookId: { type: new GraphQLNonNull(GraphQLString) },
        isFavorite: { type: new GraphQLNonNull(GraphQLBoolean) },
      },
      async resolve(parent, { bookId, isFavorite }) {
        const book = await Book.findById(bookId);
        if (!book) throw new Error("Book not found");

        book.isFavorite = isFavorite;
        return book.save();
      },
    },
  },
});

// ========== EXPORT SCHEMA ==========
export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
