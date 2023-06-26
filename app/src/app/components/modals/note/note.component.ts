import { Component, ViewChild, Input, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})

export class NoteComponent implements OnInit{
  @ViewChild('ngForm') form!: NgForm;
  @Input() modalData: any[] = [];
  isSaveButtonDisabled: boolean = true;

  constructor(public activeModal: NgbActiveModal, private apiService: ApiService, private authService: AuthService) { }
  
  ngOnInit(): void {
    if (!this.modalData[0].note_tag) {
      this.modalData[0].note_tag = '';
    }

    if (!this.modalData[0].note) {
      this.modalData[0].note = '';
    }
  }


  saveNote(text: string, category: string) {
    this.apiService.addNote(this.modalData[0].username, this.modalData[0].ada, text, category).subscribe({
      next: (data) => {
        this.isSaveButtonDisabled = true;
        this.activeModal.close({result: "success", message: data.message});
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getUsername(): string | null {
    return this.authService.getUserName();
  }

  onTextAreaChange() {
    if (this.modalData[0].note_tag != "" && this.modalData[0].note != "")
      this.isSaveButtonDisabled = false;
    else
      this.isSaveButtonDisabled = true;
  }

  onNoteCategoryChanged() {
    if (this.modalData[0].note_tag != "" && this.modalData[0].note != "")
      this.isSaveButtonDisabled = false;
    else
      this.isSaveButtonDisabled = true;
  }

}

