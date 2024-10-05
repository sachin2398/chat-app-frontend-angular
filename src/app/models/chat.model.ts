import { User } from './user.model';
import { Message } from './message.model';

export interface Chat {
  _id: string;
  chatName: string;
  users: User[];
  messages: Message[];
  isGroupChat: boolean; // New property to identify group chat
  groupAdmin?: User; // Make groupAdmin optional in case it doesn't exist in some chats
}
