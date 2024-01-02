import { Injectable, signal } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  doc,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { ProfileUser } from '../models/user';
import { Observable, concatMap, map, of, take } from 'rxjs';
import { UsersService } from './users.service';
import { Chat, Message } from '../models/chats';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  constructor(
    private firestore: Firestore,
    private usersService: UsersService
  ) {}
  createChat(otherUser: ProfileUser): Observable<string> {
    const ref = collection(this.firestore, 'chats');
    return this.usersService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) =>
        addDoc(ref, {
          userIds: [user?.uid, otherUser?.uid],
          users: [
            {
              displayName: user?.displayName || '',
            },
            {
              displayName: otherUser?.displayName || '',
            },
          ],
        })
      ),
      map((ref) => ref.id)
    );
  }

  get myChats$(): Observable<Chat[]> {
    const ref = collection(this.firestore, 'chats');
    return this.usersService.currentUserProfile$.pipe(
      concatMap((user) => {
        const myQuery = query(
          ref,
          where('userIds', 'array-contains', user?.uid)
        );
        return collectionData(myQuery, { idField: 'id' }).pipe(
          map((chats) =>
            this.addChatNameAndPic(user?.uid || '', chats as Chat[])
          )
        ) as Observable<Chat[]>;
      })
    );
  }

  selectedChat = signal<Chat | undefined>(undefined);
  myChats = toSignal(this.myChats$, {initialValue: [] as Chat[]});

  chatSelected(chatId: string) {
    const foundChat = this.myChats().find((v) => v.id === chatId);
    this.selectedChat.set(foundChat);
  }


  addChatNameAndPic(currentUserId: string, chats: Chat[]) {
    chats.forEach((chat) => {
      const otherIndex = chat.userIds.indexOf(currentUserId) == 0 ? 1 : 0;
      const { displayName } = chat.users[otherIndex];
      (chat.chatName = displayName),
        (chat.chatPic = 'assets/images/image-placeholder.png');
    });
    return chats;
  }

  addChatMessage(chatId: string, message: string): Observable<any> {
    const ref = collection(this.firestore, 'chats', chatId, 'messages');
    const chatRef = doc(this.firestore, 'chats', chatId);
    const today = Timestamp.fromDate(new Date());
    return this.usersService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) =>
        addDoc(ref, {
          text: message,
          senderId: user?.uid,
          sentDate: today,
        })
      ),
      concatMap(() =>
        updateDoc(chatRef, {
          lastMessage: message,
          lastMessageDate: today,
        })
      )
    );
  }
  getChatMessage(chatId: string): Observable<Message[]> {
    if(chatId){
      const ref = collection(this.firestore, 'chats', chatId, 'messages');
      const queryAll = query(ref, orderBy('sentDate', 'asc'));
      return collectionData(queryAll) as Observable<Message[]>;
    }else{
      return of([]) as Observable<Message[]>;
    }
    
  }

  isExistingChat(otherUserId: string): Observable<string | null> {
    return this.myChats$.pipe(
      take(1),
      map((chats: Chat[]) => {
        for (let i = 0; i < chats.length; i++) {
          if (chats[i].userIds.includes(otherUserId)) {
            return chats[i].id;
          }
        }
        return null;
      })
    );
  }
}
