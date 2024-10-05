import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly ENDPOINT = 'https://chat-app-backend-node.onrender.com';

  constructor() {
    this.socket = io(this.ENDPOINT);
  }

  // Emit events
  emit(eventName: string, data?: any) {
    this.socket.emit(eventName, data);
  }

  // Listen for events
  on(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  }

  // Disconnect the socket
  disconnect() {
    this.socket.disconnect();
  }

  // Remove specific event listeners
off(eventName: string) {
  this.socket.off(eventName);
}

}
