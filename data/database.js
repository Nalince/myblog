const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let database;

async function connectToDatabase() {
    const client = await MongoClient.connect("mongodb://localhost:27017"); //Create a connection to mongodb server
    database = client.db("blog");
}

function getDb() {
    if (!database) {
        throw { message: "Database connection is not established" };
    }
    return database;
}

module.exports = {
    connectToDatabase: connectToDatabase,
    getDb: getDb,
};
