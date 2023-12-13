import mongoose from "mongoose";
 
let isConnected = false;
 
export const connectToDB = async () => {
    mongoose.set("strictQuery", true);
   
    if(isConnected){
        console.log("MongoDB is already connected");
        return;
    }
  
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName : "QueryQuill",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            
        });
        console.log("MongoDB connected");
        isConnected = true;
        
    } catch (error) {
        console.log(error);
        
    }
}