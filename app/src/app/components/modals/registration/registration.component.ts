import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})

export class RegistrationComponent implements AfterViewInit {
  @ViewChild('ngForm') form!: NgForm;
  output: Output = { result: '', message: '' };

  constructor(public activeModal: NgbActiveModal, private apiService: ApiService, private authService: AuthService) { }

  ngAfterViewInit(): void {
    if (this.form)
      this.form.resetForm();
  }

  register(email: string, username: string, password: string, password2: string) {

    this.output.result = "";
    this.output.message = "";

    this.apiService.registerUser(username, email, password, password2).subscribe({
      next: (data) => {
        this.output.result = 'success';
        this.output.message = data.message;

        setTimeout(
          this.activeModal.close,
          3500
        )
      },
      error: (error) => {
        console.log(error);
        this.output.result = 'error'
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

interface Output {
  result: string;
  message: string;
}
