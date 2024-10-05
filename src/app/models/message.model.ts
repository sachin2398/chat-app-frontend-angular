import { User } from './user.model';

export interface Message {
  _id: string;
  sender: User;
  content: string;
  createdAt: string;
}
