import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, computed } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import {
  Observable,
  combineLatest,
  map,
  of,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { ProfileUser } from '../../models/user';
import { ChatsService } from '../../services/chats.service';
import { UsersService } from '../../services/users.service';
import { Chat } from '../../models/chats';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatListModule,
  ],
})
export class HomeComponent {
  @ViewChild('endOfChat') endOfChat!: ElementRef;
  constructor(
    public usersService: UsersService,
    private chatsService: ChatsService
  ) {}

  searchControl = new FormControl('');
  chatListControl = new FormControl(['']);
  messageControl = new FormControl('');
  myChats$ = this.chatsService.myChats$;
  user$ = this.usersService.currentUserProfile$;

  messages$ = this.chatListControl.valueChanges.pipe(
    map((value) => (value ? value[0] : '')),
    switchMap((chatId) => this.chatsService.getChatMessage(chatId)),
    tap(() => this.scroolToBottom())
  );

  selectedChat$ = combineLatest([
    this.chatListControl.valueChanges,
    this.myChats$,
  ]).pipe(
    map(([value, chats]) => {
      if (value && value[0]) {
        return chats.find((c) => c.id == value[0]);
      } else {
        return null;
      }
    })
  );

  users$ = combineLatest([
    this.usersService.users$,
    this.user$,
    this.searchControl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([users, user, search]) =>
      users.filter(
        (u) =>
          (search
            ? u.displayName?.toLowerCase().includes(search?.toLowerCase())
            : true) && u.uid != user?.uid
      )
    )
  );

  //try use signal
  myChats = computed(() => {
    try {
      return this.chatsService.myChats();
    } catch (e) {
      return [];
    }
  });

  selectedChat = this.chatsService.selectedChat;
  onSelected(chatId: string): void {
    this.chatsService.chatSelected(chatId);
  }

  messages = toSignal(toObservable(this.selectedChat).pipe(
    switchMap((selectedChat) => this.chatsService.getChatMessage(selectedChat?.id || '')),
    tap(() => this.scroolToBottom())
  ), { initialValue: [] });



  createChat(otherUser: ProfileUser) {
    this.chatsService
      .isExistingChat(otherUser.uid)
      .pipe(
        switchMap((chatId) => {
          if (chatId) {
            return of(chatId);
          } else {
            return this.chatsService.createChat(otherUser);
          }
        })
      )
      .subscribe((chatId) => {
        this.chatsService.chatSelected(chatId);
        //this.chatListControl.setValue([chatId])
      });
  }

  sendMessage() {
    const message = this.messageControl.value;
    const selectedChatId = this.selectedChat()?.id;
    if (message && selectedChatId) {
      this.chatsService
        .addChatMessage(selectedChatId, message)
        .subscribe(() => {
          this.scroolToBottom();
        });

      this.messageControl.setValue('');
    }
  }

  /* sendMessage() {
    const message = this.messageControl.value;
    const selectedChatId = this.chatListControl.value;
    if (message && selectedChatId && selectedChatId[0]) {
      this.chatsService
        .addChatMessage(selectedChatId[0], message)
        .subscribe(() => {
          this.scroolToBottom();
        });

      this.messageControl.setValue('');
    }
  } */

  convertToDateDisPlay(date: Timestamp | undefined) {
    if (!date) {
      return '';
    }
    return date?.toMillis();
  }

  scroolToBottom() {
    setTimeout(() => {
      if (this.endOfChat) {
        this.endOfChat.nativeElement.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }, 100);
  }
}
