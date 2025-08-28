import mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    fullName: {
      firstname: {
        type: String,
        required: true
      },
      lastname: {
        type: String,
        required: true
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
