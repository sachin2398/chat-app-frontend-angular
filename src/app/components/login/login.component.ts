import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginserviceService } from 'src/app/services/loginservices.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  showPassword = false;

  // Include 'info' in the alert type
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' | 'info' | null = null;

  constructor(
    private router: Router,
    private loginsrv: LoginserviceService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getGuestCredentials() {
    this.email = 'test1@gmail.com';
    this.password = 'test1';
    this.alertMessage = 'Guest credentials filled!'; // Set alert message for guest account
    this.alertType = 'info'; // Set alert type to 'info'
  }

  submitHandler() {
    if (!this.email || !this.password) {
      this.alertMessage = 'Please fill all the fields'; // Set alert message if fields are empty
      this.alertType = 'warning'; // Warning alert
      return;
    }
    this.loading = true;
    const userData = { email: this.email, password: this.password };

    this.loginsrv.login(userData).subscribe(
      (response) => {
        this.loading = false;
        this.alertMessage = response.message; // Set success message
        this.alertType = 'success'; // Success alert
        localStorage.setItem('userInfo', JSON.stringify(response));
       
        setTimeout(() => {
          this.router.navigate(['/chat']); // Redirect to login page after 2 seconds
        }, 1000);
      },
      (error) => {
        this.loading = false;
        this.alertMessage = 'Error occurred during login'; // Set error message
        this.alertType = 'error'; // Error alert
      }
    );
  }
}
