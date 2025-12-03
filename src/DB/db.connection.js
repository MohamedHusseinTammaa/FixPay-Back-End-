import mongoose from "mongoose";
const dbConnection = async () => {
    try {


        const conn = await mongoose.connect("mongodb://localhost:27017/fixpay_db_local");

        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

export default dbConnection;