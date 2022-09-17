import { User } from "../../users/schemas/user.schema";

/**
 * Class which stores information of an event participant.
 */
export class Participant {
  user: string;
  points: number;
}
