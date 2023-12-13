import { Schema, Types, model, models } from 'mongoose'

interface IMessage {
    userId: Types.ObjectId,
    fileId: Types.ObjectId,
    isUserMessage: boolean,
    text: string

}

const messageSchema = new Schema<IMessage>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    fileId: {
        type: Schema.Types.ObjectId,
        ref: "userFiles",
    },
    isUserMessage: {
        type: Boolean,
    },
    text: {
        type: String, 
    }

},
{
    timestamps : true,
})

const messageModal = models.messageModal || model("messageModal", messageSchema);

export default messageModal;