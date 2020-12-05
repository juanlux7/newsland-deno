import { MongoClient } from "https://deno.land/x/mongo@v0.13.0/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

// creating a new instance of MongoClient
const client = new MongoClient();


try {

    // configuring a local mongoDB connection on the default port
    client.connectWithUri(`mongodb+srv://juanluna:${Deno.env.get('MONGO_PASSWORD')}@devcamper.io6sb.mongodb.net/${Deno.env.get('DB_NAME')}?retryWrites=true&w=majority`);
    //client.connectWithUri(`mongodb://localhost:27017/deno-login`);


} catch(e) {
    
}



// exporting the db variable with the specific database required
export const db = client.database("newsland");
