const mongoose = require('mongoose');

const connectToDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successuflly');
    } catch(e) {
        console.log('MongoDB connection has failed');
        process.exit(1);
    }
};

module.exports = connectToDB;