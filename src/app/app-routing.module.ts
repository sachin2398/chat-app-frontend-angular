import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { AuthGuard } from './guards/auth.guard'; // Make sure to create this guard

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect to login by default
  { path: 'login', component: LoginComponent }, // Login route
  { path: 'signup', component: SignupComponent }, // Signup route
  { path: 'chat', component: ChatRoomComponent, canActivate: [AuthGuard] },
  { path: '**', component: LoginComponent} // Chat room route with guard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Register the routes
  exports: [RouterModule] // Export RouterModule for use in AppModule
})
export class AppRoutingModule { }
