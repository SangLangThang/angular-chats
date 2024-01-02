import { Timestamp } from '@angular/fire/firestore';
import { ProfileUser } from './user';

export interface Chat {
  id: string;
  lastMessage?: string;
  lastMessageDate?: Timestamp ;
  userIds: string[];
  users: ProfileUser[];

  chatPic?: string;
  chatName?: string;
}

export interface Message {
  text: string;
  senderId: string;
  sentDate: Timestamp;
}
