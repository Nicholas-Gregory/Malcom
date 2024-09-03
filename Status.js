const { model, Schema } = require('mongoose');

const statusSchema = new Schema({
    text: String
});

const Status = model('Status', statusSchema);

module.exports = Status;