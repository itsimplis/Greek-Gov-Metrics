import { Component, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/service/shared.service';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {
  @ViewChild('dropdown') dropdown!: NgbDropdown;

  constructor(private router: Router, private sharedService: SharedService, private authService: AuthService) {

  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.dropdown.close();
  }

  onUserRegistration() {
    this.sharedService.openRegistrationModal();
  }

  onUserLogin() {
    this.sharedService.openLoginModal();
  }

  onLogout() {
    this.sharedService.closeAllUserRelatedModals();
    this.router.navigate(['home-page'])
    this.authService.logout();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getUsername() {
    return this.authService.getUserName();
  }
}
