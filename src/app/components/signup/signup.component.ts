import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SignupservicesService } from 'src/app/services/signupservices.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  pic: string = '';
  loading = false;
  showPassword = false;
  alertMessage: string | null = null; // For alert message
  alertType: 'success' | 'error' | null = null; // For alert type

  constructor(private http: HttpClient, private router: Router, private signupSer: SignupservicesService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  postDetails(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.showAlert('Please select an image', 'error');
      return;
    }

    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'rd-chat');
      formData.append('cloud_name', 'dfbxn1pfe');

      this.loading = true;

      this.http.post('https://api.cloudinary.com/v1_1/dfbxn1pfe/image/upload', formData)
        .subscribe((response: any) => {
          this.pic = response.url;
          this.loading = false;
        }, (error: any) => {
          console.error(error);
          this.loading = false;
          this.showAlert('Image upload failed', 'error');
        });
    } else {
      this.showAlert('Please select a valid image format (JPEG/PNG)', 'error');
    }
  }

  submitHandler() {
    if (this.password !== this.confirmPassword) {
      this.showAlert("Passwords do not match.", "error");
      return;
    }
   // Set default image if the user hasn't uploaded one
   if (!this.pic) {
    this.pic = 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1727530740~exp=1727531340~hmac=0bb7e69a0148be3425d42d948570f238acaeeda62e38e57283f38b6ec31c9fb8';
  }
    const userData = {
      name: this.name,
      email: this.email,
      password: this.password,
      pic: this.pic
    };
  
    this.loading = true;

    this.signupSer.signup(userData).subscribe(
      (response) => {
        this.loading = false;
        this.showAlert(response.message, 'success'); 
        localStorage.setItem('userInfo', JSON.stringify(response));
        setTimeout(() => {
          this.router.navigate(['/chat']); // Redirect to login page after 2 seconds
        }, 1000);
      },
      (error) => {
        this.loading = false;
        console.error(error);
        this.showAlert('Signup failed. Please try again.', 'error');
      }
    );
  }

  private showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;

    // Automatically hide the alert after a few seconds
    setTimeout(() => {
      this.alertMessage = null;
      this.alertType = null;
    }, 3000);
  }
}
