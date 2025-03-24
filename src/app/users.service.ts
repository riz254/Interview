import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private jsonUrl = 'assets/users.json';

  constructor(private http: HttpClient) {}

  // get users from json
  getUsers(): Observable<any> {
    return this.http.get<any>(this.jsonUrl);
  }
}
