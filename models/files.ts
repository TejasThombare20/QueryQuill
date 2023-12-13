import { Schema, Types, model, models } from "mongoose";

interface Files {
  userId: Types.ObjectId,
  name: string,
  key: string,
  status: string,
  url: string,

}


const userFiles = new Schema<Files>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },

    key: {
      type: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "FAILED", "SUCCESS"],
      default: "PENDING",
    },
    url: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Files = models.userFiles || model<Files>("userFiles", userFiles);

export default Files;
