import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  from_user_id: {type: String, ref: 'User', require: true},
  to_user_id: {type: String, ref: 'User', require: true},
  status: {type: String, enum: ['pendin', 'accepted'], defaiult: 'pending'},
}, {timestamps: true})

const connection = mongoose.model('Connection', connectionSchema)

export default Connection