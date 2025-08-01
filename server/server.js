import express from "express";
import { graphqlHTTP } from "express-graphql";
import schema from "./schema/schema.js";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { authenticate } from "./middleware/auth.js";
// import { graphqlUploadExpress } from "graphql-upload";

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
// app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

app.use(
  "/graphql",
  graphqlHTTP((req) => {
    const user = authenticate(req);
    return {
      schema,
      graphiql: true,
      context: { user },
    };
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
