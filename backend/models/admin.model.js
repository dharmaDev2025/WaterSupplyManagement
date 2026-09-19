import mongoose from "mongoose";
const adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
         required:true,
        trim:true,
        unique:true,
        lowercase:true,
        
    },
 
    
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
       loginOtpHash: {
      type: String,
      default: null,
    },

    loginOtpExpire: {
      type: Date,
      default: null,
    },
     resetOtpHash: {
      type: String,
      default: null,
    },

    resetOtpExpire: {
      type: Date,
      default: null,
    },
       lastLogin: {
      type: Date,
      default: null,
    },


},
{
    timestamps: true,
});
const Admin=new mongoose.model("Admin",adminSchema);
export default Admin;