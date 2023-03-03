import { UserDocument } from "../../users/schemas/user.schema";

/**
 * Class which stores information of an event participant.
 */
export class Participant {
  /**
   * The object ID of the user (not the user ID).
   *
   */
  user: string | UserDocument;
  /**
   * The number of points to be assigned to the particpant.
   */
  points: number;
}
