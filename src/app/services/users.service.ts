import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDoc,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { filter, from, map, Observable, of, switchMap } from 'rxjs';
import { ProfileUser } from '../models/user';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(
    private firestore: Firestore,
    private authService: AuthenticationService
  ) {}

  get currentUserProfile$(): Observable<ProfileUser | null> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return of(null);
        }

        const ref = doc(this.firestore, 'users', user?.uid);
        return docData(ref).pipe(
          switchMap((profile) => {
            if (profile) {
              return of(profile as ProfileUser);
            } else {
              const newUser = {
                uid: user.uid,
                displayName: user?.email?.split('@')[0],
                email: user?.email,
              } as ProfileUser;
              const addUserRef = doc(this.firestore, 'users', user?.uid);
              return from(setDoc(addUserRef, newUser)).pipe(
                switchMap(() => of(newUser))
              );
            }
          })
        );
      })
    );
  }

  get users$(): Observable<ProfileUser[]> {
    const ref = collection(this.firestore, 'users');
    const queryAll = query(ref);
    return collectionData(queryAll) as Observable<ProfileUser[]>;
  }

  addUser(user: ProfileUser): Observable<void> {
    const ref = doc(this.firestore, 'users', user.uid);
    return from(setDoc(ref, user));
  }
}
