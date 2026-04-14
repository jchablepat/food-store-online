import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../shared/models/User';
import { IUserLogin } from '../shared/interfaces/IUserLogin';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LOGIN_URL, REGISTER_URL } from '../shared/constants/urls';
import { ToastrService } from 'ngx-toastr';
import { IUserRegister } from '../shared/interfaces/IUserRegister';
import { getHttpErrorMessage } from '../shared/utils/http-error-message';

const USER_KEY = 'User';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User>(this.getUserFromLocalStorage()); // Only for memory ...<User>(new User())
  public userObservable:Observable<User>;

  constructor(private http: HttpClient, private toastr: ToastrService) {
    this.userObservable = this.userSubject.asObservable();
  }

  public get currentUser() : User {
    return this.userSubject.value;
  }

  login(userLogin: IUserLogin): Observable<User> {
   return this.http.post<User>(LOGIN_URL, userLogin).pipe(
      tap({
        next: (user) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastr.success(
            `Welcome to Home Pizza ${user.name}`,
            'Login Successful'
          );
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.toastr.error(
            getHttpErrorMessage(errorResponse, 'No se pudo iniciar sesion. Intenta nuevamente.'),
            'Login Failed'
          );
        }
      })
    ); 
  }

  register(userRegister : IUserRegister) : Observable<User> {
    return this.http.post<User>(REGISTER_URL, userRegister).pipe(
      tap({
        next: (user) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastr.success(
            `Welcome ${user.name}`,
            'Register Successful'
          );
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.toastr.error(
            getHttpErrorMessage(errorResponse, 'No se pudo completar el registro. Intenta nuevamente.'),
            'Register Failed'
          );
        }
      })
    );
  }

  logout() :void {
    this.userSubject.next(new User());
    localStorage.removeItem(USER_KEY);
    window.location.reload();
  }

  private setUserToLocalStorage(user: User):void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private getUserFromLocalStorage() : User {
    const userJson = localStorage.getItem(USER_KEY);

    return userJson ? (JSON.parse(userJson) as User): new User();
  }
}
