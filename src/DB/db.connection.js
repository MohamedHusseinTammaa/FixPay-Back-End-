import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        // --- 1. Define the hardcoded local MongoDB URI ---
        // REPLACE 'fixpay_db_local' with the database name you want
        const localMongoURI = "mongodb://localhost:27017/fixpay_db_local"; 
        
        // --- 2. Connect using the hardcoded string ---
        const conn = await mongoose.connect(localMongoURI);   
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        // Exit the application if the database connection fails
        process.exit(1); 
    }
};

export default dbConnection;