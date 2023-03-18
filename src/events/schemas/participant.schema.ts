import mongoose from "mongoose";

import { UserDocument } from "../../users/schemas/user.schema";

export const participantSchema = {
  _id: false,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  points: Number,
};

/**
 * The Class representing a participant in the database.
 */
export class Participant {
  /**
   * The user object.
   */
  user: UserDocument;
  /**
   * The number of points to be assigned to the particpant.
   */
  points: number;
}
