import mongoose from "mongoose";
const dbConnection = async () => {
    try {

        const conn = await mongoose.connect("mongodb+srv://mohamedsamirrrrrr:oSwPavil69GixLCN@cluster0.9dtw3jp.mongodb.net/fixpay?retryWrites=true&w=majority"
);   
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

export default dbConnection;