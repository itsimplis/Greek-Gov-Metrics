import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';
import { SharedService } from 'src/app/service/shared.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  notes: any[];

  constructor(private apiService: ApiService, private authService: AuthService, private sharedService: SharedService) {
    this.notes = [];

    this.sharedService.onNoteSaveCompleted.subscribe(result => {
      if (result.result == "success"){
        this.showSuccessAlert(result.message);
        this.loadAllNotes(this.authService.getUserName()!);
      }
      else
        this.showErrorAlert(result.message);
    });
  }

  ngOnInit(): void {
    this.loadAllNotes(this.authService.getUserName()!);
  }

  // Call to the API to get all notes for the current user
  public loadAllNotes(username: string): void {
    this.sharedService.startRequest();
    this.notes = [];

    this.apiService.getAllNotes(username).subscribe({
      next: (data) => {
        this.notes = this.notes = data.map(note => ({...note, isExpanded: false}));
        this.sharedService.endRequest();
      },
      error: (error) => {
        console.log(error);
        this.sharedService.endRequest();
      }
    });
  }

    // Show the success alert
    showSuccessAlert(text: string): void {

      const alertSuccess = document.getElementById("main-alert");
      if (alertSuccess) {
        alertSuccess.innerHTML = `<strong>${text}</strong>`
        alertSuccess.className = "alert custom-alert rounded alert-success"; 
        alertSuccess.style.display = 'block';
      }
      setTimeout(() => {
        document.getElementById("main-alert")!.style.display = 'none';
      }, 3500);
    }
  
    // Show the success alert
    showErrorAlert(text: string): void {
  
      const alertError = document.getElementById("main-alert");
      if (alertError) {
        alertError.innerHTML = `<strong>${text}</strong>`
        alertError.className = "alert custom-alert rounded alert-danger";
        alertError.style.display = 'block';
      }
      setTimeout(() => {
        document.getElementById("main-alert")!.style.display = 'none';
      }, 3500);
    }

    // Dynamic icon setting based on note_tag value
    getIconPath(noteTag: string): string {
      switch (noteTag) {
        case '1':
          return '../../assets/icons/tag-green.svg';
        case '2':
          return '../../assets/icons/tag-orange.svg';
        case '3':
          return '../../assets/icons/tag-red.svg';
        default:
          return '../../assets/icons/tag-default.svg';
      }
    }

    // Dynamic tooltip setting based on note_tag value
    getIconName(noteTag: string): string {
      switch (noteTag) {
        case '1':
          return 'Κανονική σημείωση';
        case '2':
          return 'Σημαντική σημείωση';
        case '3':
          return 'Πολύ Σημαντική σημείωση';
        default:
          return '../../assets/icons/tag-default.svg';
      }
    }

   // Loading Spinners
   isLoading(): boolean {
    return this.sharedService.isLoading();
  }

  onButtonViewDetailsClick(ada: string) {
    this.sharedService.openDetailsModal(ada);
  }

  onButtonEditClick(username: string, ada: string) {
    this.sharedService.openNoteModal(username, ada);
  }

  onButtonRemoveClick(username: string, ada: string) {
    this.apiService.addNote(username, ada,"", "").subscribe({
      next: (data) => {
        this.showSuccessAlert(data.message);
        this.loadAllNotes(this.authService.getUserName()!);
      },
      error: (error) => {

      }
    }); 
  }
}
