import { connect } from "http2";
import mongoose from "mongoose";

type ConnectionObject= {
    isConnected?: number
}

const connection: ConnectionObject= {
    
}

async function dbConnect(): Promise<void> {
if(connection.isConnected){
    console.log("already connected");
    return;
}

try {
    const db= await mongoose.connect(process.env.MONGODB_URI || 
        ""
    );
    connection.isConnected= db.connections[0].readyState;

    console.log("connected to db");


} catch (error) {
    console.log("having issue with connection"+error);
    process.exit(1);
}
}

export default dbConnect;