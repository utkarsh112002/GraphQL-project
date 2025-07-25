import express from "express"
import {graphqlHTTP} from "express-graphql"
import schema from "./schema/schema.js"
import mongoose from "mongoose";
import cors from 'cors'
const app = express()

app.use(cors({ origin: 'http://localhost:3000' }))

mongoose.connect("mongodb://localhost:27017/graphql-books", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("✅ Connected to MongoDB");
});


app.use('/graphql',graphqlHTTP({
schema,
graphiql: true
}))



app.listen(4000, () => {
    console.log("server is running on 4000")
})