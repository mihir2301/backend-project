import mongoose,{Schema} from "mongooose"

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps: true})