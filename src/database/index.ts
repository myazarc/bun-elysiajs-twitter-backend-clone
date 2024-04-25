import mongoose from "mongoose";
import "./schemas/user.schema";
import "./schemas/follow.schema";
import "./schemas/tweet.schema";
import "./schemas/favorite.schema";
import "./schemas/file.schema";

const mongoDBURI = Bun.env.MONGO_URI!;

try {
  await mongoose.connect(mongoDBURI, {
    dbName: Bun.env.MONGO_DB_NAME!,
  });
} catch (error) {
  console.log("connect", error);
}

export default mongoose;
