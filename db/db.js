import mongoose from 'mongoose';

export const DatabaseConnector = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected successfully': ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit the process with failure
    }   
}