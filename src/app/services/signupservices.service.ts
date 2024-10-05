import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupservicesService {
  private signupUrl = "https://chat-app-backend-node.onrender.com/api/user";

  constructor(private http: HttpClient) { }

  signup(userData: any): Observable<any> {
    console.log(userData);
    return this.http.post(this.signupUrl, userData);
  }
}
