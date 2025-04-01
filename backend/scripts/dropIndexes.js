const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Drop the unique index on the name field
        await mongoose.connection.collection('organizations').dropIndex('name_1');
        console.log('Successfully dropped the unique index on name field');

        // Create a new non-unique index
        await mongoose.connection.collection('organizations').createIndex({ name: 1 }, { unique: false });
        console.log('Created new non-unique index on name field');

        console.log('All done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

dropIndexes(); 