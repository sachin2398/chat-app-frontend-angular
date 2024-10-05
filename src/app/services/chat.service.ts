
// chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
}) 
export class ChatService {
  private apiUrl = "https://chat-app-backend-node.onrender.com/api" ;

  constructor(private http: HttpClient) {}

  // Search users
  searchUsers(query: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/user?search=${query}`, { headers });
  }

  // Start one-to-one chat
  startChat(userId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/chat`, { userId }, { headers });
  }

  // Get chat messages
  getChatMessages(chatId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/message/${chatId}`, { headers });
  }
// get previous chats

getPreviousChats(token: string): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.apiUrl}/chat`, { headers });
}


  // Send a message
  sendMessage(content: string, chatId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(
      `${this.apiUrl}/message`,
      { content, chatId },
      { headers }
    );
  }

/// till now today all part is working properly
// Create group chat


createGroupChat(name: string, users: any[], token: string): Observable<any> {
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
  // Convert the users array to JSON string format
  const body = {
    name,
    users: JSON.stringify(users.map((u) => u._id)) // Assuming each user has an _id property
  };

  return this.http.post(`${this.apiUrl}/chat/group`, body, { headers });
}

  // chat.service.ts
// rename group
  renameGroup(requestData: { chatId: string; chatName: string }, headers: any) {
    return this.http.put<any>(`${this.apiUrl}/chat/rename`, requestData, { headers });
  }
  
  addUserToGroupEdit(data: { chatId: string; userId: string }, token: string) {
    return this.http.put(`${this.apiUrl}/chat/groupadd`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  
  removeUserFromGroup(chatId: string, userId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { chatId, userId };

    return this.http.put(`${this.apiUrl}/chat/groupremove`, body, { headers });
  }
  

}

