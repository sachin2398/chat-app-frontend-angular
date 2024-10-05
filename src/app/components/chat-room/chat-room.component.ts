import { Component, OnInit, ViewChild, ElementRef ,OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from 'src/app/services/chat.service';
import { Chat } from 'src/app/models/chat.model';
import * as bootstrap from 'bootstrap';
import { SocketService } from 'src/app/services/socket.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css'],
})
/// till now today all part is working properly
export class ChatRoomComponent implements OnInit,OnDestroy ,OnChanges{
  userInfo: any;
  searchQuery = '';
  searchResults: any[] = [];
  selectedUser: any;
  selectedChat: Chat | null = null;
  newMessage = '';
  chats: any[] = [];
  previousChats: Chat[] = [];
  token: string = '';
 // Group chat variables
 groupName = '';

 groupUsers: any[] = [];  // To hold selected users for the group
 groupUserQuery = '';
 groupUserResults: any[] = [];
 isModalOpen: boolean = false; // Tracks modal state for eye view state changes
 // Modal instances
 addUserQuery = ''; // New search query for adding users
addUserResults: any[] = []; // To store the search results
noUsersFoundMessage: string = ''; 
noUsersToAddFoundMessage: string = ''; // New variable for adding users search message
 private profileModal: bootstrap.Modal | null = null;
 // socket variables
 socketConnected: boolean = false;
 fetchAgain: boolean = false;
 isTyping: boolean = false;
 typing: boolean = false;
 notifications: any[]=[];
 showNotifications:boolean = false;
 private subscriptions: Subscription[] = [];


  @ViewChild('chatWindow') chatWindow!: ElementRef;
  @ViewChild('profileModal') profileModalElement!: ElementRef;
  constructor(
    private chatService: ChatService,
    private router: Router,
    private toastr: ToastrService,
    private socketService: SocketService
   
  ) {
    this.loadUserInfo();
  }

  ngOnInit() :void{
    const user = localStorage.getItem('userInfo');
   
    if (user) {
      this.userInfo = JSON.parse(user);
      this.token = this.userInfo.token;
      this.loadPreviousChats();
      // this.socketService.connect(this.userInfo._id);
      this.socketService.emit('setup', this.userInfo);
      const connectedSub = this.socketService.on('connected').subscribe(() => {
        this.socketConnected = true;
        console.log('Socket connected');
      });
      //typing

      
    const typingSub = this.socketService.on('typing').subscribe(() => {
      this.isTyping = true;
    });

    const stopTypingSub = this.socketService.on('stop typing').subscribe(() => {
      this.isTyping = false;
    });

      //mesasage to live
      const messageSub = this.socketService.on('message recieved').subscribe((newMessage) => {
        if (!this.selectedChat || this.selectedChat._id !== newMessage.chat._id) {
          // Notify if a new message comes from a different chat
          //notification logic will go here
        // If the message is from a different chat, add it to notifications
        if (!this.notifications.includes(newMessage)) {
          this.notifications.push(newMessage);
        }
        // Notification logic when the message is not in the current chat

          ////notification logic write here///
        
        } else {
          this.chats.push(newMessage);
        }
      });
   
        // Store subscriptions to clean up later
    this.subscriptions.push(connectedSub,typingSub, stopTypingSub,messageSub);
      
 // Initial message fetch
 this.getChatMessages();
 this.loadPreviousChats();
      
    } else {
      this.router.navigate(['/login']);
    }
  }
 
  ngOnChanges(changes: SimpleChanges): void {
    // Handle changes to selectedChat, equivalent to componentDidUpdate in React
    if (changes['loadPreviousChats'] && !changes['loadPreviousChats'].isFirstChange()) {
      this.getChatMessages();
      
    }
  }

  ngOnDestroy(): void {
    // Cleanup on component destroy, equivalent to componentWillUnmount in React
    this.subscriptions.forEach(sub => sub.unsubscribe());

    this.socketService.disconnect();
  }

  loadUserInfo() {
    const user = localStorage.getItem('userInfo');
    if (user) {
      this.userInfo = JSON.parse(user);
    }
  }

  
// profile model
 
openProfileModal() {
  const modalElement = document.getElementById('profileModal') as HTMLElement;
  this.profileModal = new bootstrap.Modal(modalElement);
  this.profileModal.show();
}

closeProfileModal() {
  if (this.profileModal) {
    this.profileModal.hide();
  }
}
  loadPreviousChats() {
    this.chatService.getPreviousChats(this.token).subscribe(
      (response: Chat[]) => {
        console.log("load previous this.chats", response);
  
        const uniqueChats: { [key: string]: Chat } = {};
  
        response.forEach(chat => {
          const otherUserIds = chat.users
            .filter(user => user._id !== this.userInfo._id)
            .map(user => user._id)
            .sort()
            .join(',');
  
          // Ensure uniqueness by using the user IDs as a key
          if (!uniqueChats[otherUserIds]) {
            uniqueChats[otherUserIds] = chat; // Store chat if it’s not already included
          }
        });
  
        // Convert the uniqueChats object back to an array and store it
        this.previousChats = Object.values(uniqueChats);
  
        // Ensure the group chats are included
        this.previousChats = this.previousChats.filter(chat => chat.isGroupChat || chat.users.length > 1);
  
        // Handle the group chats and group admin details
        this.previousChats.forEach(chat => {
          if (chat.isGroupChat) {
            // Log the group admin information to ensure it exists
            console.log(`Group Admin for ${chat.chatName}:`, chat.groupAdmin);
          }
        });
      },
      (error: any) => {
        this.toastr.error('Failed to load previous chats', 'Error');
      }
    );
  }
  
  
  
  

  searchUsers() {
    // Clear search results if the search query is empty
    if (this.searchQuery.trim() === '') {
      this.searchResults = [];
      this.noUsersFoundMessage = ''; // Clear the message
      return;
    }

    this.chatService.searchUsers(this.searchQuery, this.token).subscribe(
      (response) => {
        // Limit the number of results to a maximum of 4
        this.searchResults = response.slice(0, 4);

        // Check if any users were found
        if (this.searchResults.length === 0) {
          this.noUsersFoundMessage = 'User not found'; // Set the message
        } else {
          this.noUsersFoundMessage = ''; // Clear the message if users are found
        }

        // Automatically select the chat if the user is in previous chats
        const existingChat = this.previousChats.find(chat => {
          return chat.users.some(user => user.name.toLowerCase() === this.searchQuery.toLowerCase());
        });

        if (existingChat) {
          this.selectPreviousChat(existingChat);
        }
      },
      (error) => {
        this.noUsersFoundMessage = 'Failed to search users'; // Optional: set an error message
      }
    );
  }

  
  
  
  

  selectPreviousChat(chat: Chat) {
    if (this.selectedChat && this.selectedChat._id === chat._id) {
      return; // Avoid reselecting the same chat
    }
    this.selectedChat = chat;
    this.chats = chat.messages || [];
    this.getChatMessages();
    this.scrollToBottom();
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.chatService.startChat(user._id, this.token).subscribe(
      (response: Chat) => {
        this.selectedChat = response;
        this.getChatMessages();
        this.loadPreviousChats();
      },
      (error) => {
        this.toastr.error('Failed to start chat', 'Error');
      }
    );
  }

  getChatMessages() {
    if (!this.selectedChat) return;

    this.chatService.getChatMessages(this.selectedChat._id, this.token).subscribe(
      (response) => {
        this.chats = response;
      
        console.log("chat cheking",response);
        this.socketService.emit('join chat', this.selectedChat?._id);
        this.scrollToBottom();
      },
      (error) => {
        this.toastr.error('Failed to fetch messages', 'Error');
      }
    );
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChat) return;
  
    
    this.socketService.emit('stop typing', this.selectedChat._id);
    // Send the message through the chat service
    this.chatService.sendMessage(this.newMessage, this.selectedChat._id, this.token).subscribe(
      (response) => {
        this.socketService.emit('new message', response);
        // Update local chat history with the response from the service

        this.chats.push(response);
        if (this.selectedChat) {
          this.selectedChat.messages = this.selectedChat.messages || [];
          this.selectedChat.messages.push(response);
        }
  
        // Emit the new message event through the socket for real-time updates
      
        // Clear the input field and scroll to the bottom
        this.newMessage = '';
        this.scrollToBottom();
      },
      (error) => {
        this.toastr.error('Failed to send message', 'Error');
      }
    );
  }
  

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
      event.preventDefault();
    }
  }
  handleTyping(){
    if (!this.socketConnected) return;
    if (!this.typing) {
      this.typing = true;
      this.socketService.emit('typing', this.selectedChat?._id);
    }
    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && this.typing) {
        this.socketService.emit('stop typing', this.selectedChat?._id);
        this.typing = false;
      }
    }, timerLength);
  }
  private scrollToBottom() {
    if (this.chatWindow) {
      this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
    }
  }

  getChatProfilePic(chat: Chat): string {
    const otherUsers = chat.users.filter(user => user._id !== this.userInfo._id);
    return otherUsers.length ? otherUsers[0].pic : 'default-pic.png';
  }
  getChatUserName(chat: Chat): string {
    if (chat.isGroupChat) {
      const adminName = chat.groupAdmin?.name || 'Unknown Admin'; // Fallback if admin name is not available
      return `${chat.chatName}`; // Return group chat name and admin name
    } else {
      const otherUsers = chat.users.filter(user => user._id !== this.userInfo._id);
      return otherUsers.length ? otherUsers[0].name : 'Unknown User';
    }
  }
  
  

  logout() {
    localStorage.removeItem('userInfo');
    this.router.navigate(['/login']);
  }

  openGroupChatModal() {
    const modalElement = document.getElementById('groupChatModal') as HTMLElement; // Use type assertion
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }


  // group chat logic start from here to create the group 

//search for groupusers
  searchGroupUsers() {
    if (this.groupUserQuery.trim() === '') {
      this.groupUserResults = [];
      return;
    }
    this.chatService.searchUsers(this.groupUserQuery, this.token).subscribe(
      (response) => {
        this.groupUserResults = response.slice(0, 4);
      },
      (error) => {
        this.toastr.error('Failed to search users', 'Error');
      }
    );
  }
    // Add a user to group chat
    addUserToGroup(user: any) {
      if (!this.groupUsers.some(u => u._id === user._id)) {
        this.groupUsers.push(user);
      }
    }
    

     // Remove a user from group
  removeUserFromGroup(user: any) {
    this.groupUsers = this.groupUsers.filter(u => u._id !== user._id);
  }
 

  createGroupChat() {
    
    
    if (!this.groupName.trim() || this.groupUsers.length < 2) {
      this.toastr.error('Group name and at least 2 users are required', 'Error');
      return;
    }
  
   console.log("usr id in this", this.groupUsers);
  
    this.chatService.createGroupChat(this.groupName, this.groupUsers, this.token).subscribe(
      (response) => {
        
        console.log('Group created successfully:', response);  // Log the response here
        this.loadPreviousChats();
        this.toastr.success('Group chat created successfully', 'Success');
        this.groupName = '';
        this.groupUsers = [];
        const modalElement = document.getElementById('groupChatModal') as HTMLElement;
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      },
      (error) => {
        console.log('Error creating group chat:', error);
        this.toastr.error('Failed to create group chat', 'Error');
      }
    );
  }
  
   // group chat logic end from here to create the group

  //eye chat STATE
  showModal(): void {
    this.isModalOpen = true;
  }

  // Method to close the modal
  closeModal(): void {
    this.isModalOpen = false;
  }
  updateGroup() {
    // Check if the group name is empty
    if (!this.groupName.trim()) {
      this.toastr.error('Please fill the group name', 'Error');
      return;
    }
  
    // Check if the selected chat and chat ID exist
    if (!this.selectedChat || !this.selectedChat._id) {
      this.toastr.error('No group selected', 'Error');
      return;
    }
  
    // Prepare the request payload
    const requestData = {
      chatId: this.selectedChat._id,  // Chat ID is guaranteed to exist here
      chatName: this.groupName
    };
  
    // Prepare the headers with the token
    const headers = {
      Authorization: `Bearer ${this.token}`
    };
  
    // Make the PUT request using the chat service
    this.chatService.renameGroup(requestData, headers).subscribe(
      (response) => {
        // Handle success response
        this.selectedChat = response; // Update the selected chat with the new name
        this.toastr.success('Group name updated successfully', 'Success');
        this.groupName = ''; // Reset the input field
  
        // Optionally, reload chats if needed
        this.loadPreviousChats();
      },
      (error) => {
        // Handle error response
        this.toastr.error(error.error.message || 'Failed to update group name', 'Error');
      }
    );
  }
  
  
// Function to search users for adding to the group
searchUsersToAdd() {
  // Clear search results if the add user query is empty
  if (this.addUserQuery.trim() === '') {
    this.addUserResults = [];
    this.noUsersToAddFoundMessage = ''; // Clear the message
    return;
  }

  this.chatService.searchUsers(this.addUserQuery, this.token).subscribe(
    (response) => {
      this.addUserResults = response.slice(0, 4);

      // Check if any users were found to add
      if (this.addUserResults.length === 0) {
        this.noUsersToAddFoundMessage = 'User not found'; // Set the message
      } else {
        this.noUsersToAddFoundMessage = ''; // Clear the message if users are found
      }
    },
    (error) => {
      this.noUsersToAddFoundMessage = 'Failed to search users to add'; // Optional: set an error message
    }
  );
}

// Function to add a user to the group
addUserToGroupEdit(user: any) {
  // Check if the user is already in the group
  if (this.selectedChat?.users.find(u => u._id === user._id)) {
    this.toastr.error('User is already in the group!', 'Error');
    return;
  }

  // Check if the current user is the group admin
  if (this.selectedChat?.groupAdmin?._id !== this.userInfo._id) {
    this.toastr.error('Only admins can add users!', 'Error');
    return;
  }
  
  if (!this.selectedChat?._id) {
    this.toastr.error('No group selected', 'Error');
    return;
  }

  // Make the PUT request to add the user
  const requestData = {
    chatId: this.selectedChat?._id,
    userId: user._id
  };

  this.chatService.addUserToGroupEdit(requestData, this.token).subscribe(
    (response: any) => {  // Temporarily accept any type for the response
      this.selectedChat = response as Chat; // Cast response to Chat type
      this.toastr.success('User added to the group!', 'Success');
      this.loadPreviousChats(); // Optionally reload chats
    },
    (error) => {
      this.toastr.error('Failed to add user to the group', 'Error');
    }
  );
}


removeUserOrLeaveGroup(user: any) {
  const isSelf = user._id === this.userInfo._id;

  // Ensure selectedChat._id is available
  const chatId = this.selectedChat?._id;
  if (!chatId) {
    this.toastr.error('Chat ID is missing!', 'Error');
    return;
  }

  // Check if the current user is allowed to remove another user
  if (!isSelf && this.selectedChat?.groupAdmin?._id !== this.userInfo._id) {
    this.toastr.error('Only admins can remove other users!', 'Error');
    return;
  }

  const userIdToRemove = isSelf ? this.userInfo._id : user._id;

  this.chatService.removeUserFromGroup(chatId, userIdToRemove, this.token).subscribe(
    (response) => {
      if (isSelf) {
        this.toastr.success('You have left the group!', 'Success');
        // Optionally, you can clear the selected chat or perform other UI updates
        this.selectedChat = null; // Reset the selected chat, or handle it differently
        this.closeModal();
      } else {
        this.toastr.success(`${user.name} has been removed from the group!`, 'Success');
        this.selectedChat = response; // Update the chat after removing the user
      }

      this.loadPreviousChats(); // Reload previous chats after the change
    },
    (error) => {
      this.toastr.error('Failed to remove user from the group', 'Error');
    }
  );
}



   
  // notifications logic
  // Handle notification click to redirect the user to the specific chat
  handleNotificationClick(notification: any): void {
    this.selectedChat = notification.chat; // Set the selected chat to the one from notification
    this.getChatMessages(); // Load the messages for that chat
    this.notifications = this.notifications.filter(n => n !== notification); // Remove notification from the list
  }

  // Method to clear all notifications
  clearNotifications(): void {
    this.notifications = [];
  }


toggleNotificationDropdown(): void {
  this.showNotifications = !this.showNotifications;
}
  
truncateContent(content: string, wordLimit: number = 5): string {
  const words = content.split(' ');
  return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : content;
}

}
