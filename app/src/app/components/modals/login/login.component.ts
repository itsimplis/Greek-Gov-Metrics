import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements AfterViewInit {
  @ViewChild('ngForm') form!: NgForm;
  output: Output = { result: '', message: '' };

  constructor(public activeModal: NgbActiveModal, private apiService: ApiService, private authService: AuthService) { }

  ngAfterViewInit(): void {
    if (this.form)
      this.form.resetForm();

    console.log(this.authService.getAuthToken());
  }

  login(username: string, password: string) {

    this.output.result = "";
    this.output.message = "";

    this.apiService.loginUser(username, password).subscribe({
      next: (data) => {
        this.authService.setAuthToken(data.access_token);
        this.authService.setUserName(data.username);
        this.output.result = "success"
        this.output.message = data.message;

        setTimeout(
          this.activeModal.close,
          2500
        )
      },
      error: (error) => {
        this.output.result = "error"
        if (error.status === 400) {
          this.output.message = error.error.detail;
        } else if (error.status === 401) {
          this.output.message = 'Δεν επιτρέπεται η πρόσβαση!';
        } else {
          this.output.message = 'Προέκυψε κάποιο σφάλμα!';
        }
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}

interface LoginResponse {
  access_token: string;
}

interface Output {
  result: string;
  message: string;
}
