import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginserviceService {
  private loginUrl = "https://chat-app-backend-node.onrender.com/api/user/login";

  constructor(private http: HttpClient) { }

  login(userData: any): Observable<any> {
    console.log(userData);
    return this.http.post(this.loginUrl, userData);
  }
}
