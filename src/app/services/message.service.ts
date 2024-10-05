import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = 'https://chat-app-backend-node.onrender.com/api/message'; // Hardcoded API URL

  constructor(private http: HttpClient) {}

  sendMessage(content: string, chatId: string) {
    return this.http.post(`${this.apiUrl}`, { content, chatId });
  }

  fetchMessages(chatId: string) {
    return this.http.get(`${this.apiUrl}/${chatId}`);
  }
}
