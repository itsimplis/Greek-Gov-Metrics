import { EventEmitter, Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ViewDetailsComponent } from '../components/modals/view-details/view-details.component';
import { ApiService } from './api.service';
import { LoginComponent } from '../components/modals/login/login.component';
import { RegistrationComponent } from '../components/modals/registration/registration.component';
import { MapDetailsComponent } from '../components/modals/map-details/map-details.component';
import { NoteComponent } from '../components/modals/note/note.component';

@Injectable({
  providedIn: 'root',
})


export class SharedService {

  requestsInProgress: number;
  expensesPage: string
  detailsModal?: NgbModalRef;
  registrationModal?: NgbModalRef;
  loginModal?: NgbModalRef;
  noteModal?: NgbModalRef;
  mapModalMun?: NgbModalRef;
  mapModalReg?: NgbModalRef;
  public onNoteSaveCompleted: EventEmitter<any> = new EventEmitter();

  constructor(private modalService: NgbModal, private apiService: ApiService) {
    this.registrationModal = undefined;
    this.expensesPage = "";
    this.requestsInProgress = 0;
  }

  openDetailsModal(selectedAda: string) {
    this.apiService.getDecision(selectedAda).subscribe({
      next: (data) => {
        this.detailsModal = this.modalService.open(ViewDetailsComponent, {
          ariaLabelledBy: 'modal-basic-title',
          centered: true,
          size: 'xl',
        });
        this.detailsModal.componentInstance.modalData = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  openMapModalMunicipalities(municipality: string) {
    this.apiService.getMunicipalityData(municipality).subscribe({
      next: (data) => {
        this.mapModalMun = this.modalService.open(MapDetailsComponent, {
          ariaLabelledBy: 'modal-basic-title',
          centered: true,
          backdrop: false,
          size: 'md',
        });
        this.mapModalMun.componentInstance.modalData = data;
        this.mapModalMun.componentInstance.mapType = "municipality";
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  openMapModalRegions(region: string) {
    this.apiService.getRegionData(region).subscribe({
      next: (data) => {
        this.mapModalReg = this.modalService.open(MapDetailsComponent, {
          ariaLabelledBy: 'modal-basic-title',
          centered: true,
          backdrop: false,
          size: 'md',
        });
        this.mapModalReg.componentInstance.modalData = data;
        this.mapModalReg.componentInstance.mapType = "region";
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  openNoteModal(username: string, ada: string) {
    this.apiService.getNote(username, ada).subscribe({
      next: (data) => {
        this.noteModal = this.modalService.open(NoteComponent, {
          ariaLabelledBy: 'modal-basic-title',
          centered: true,
          size: 'md',
        });
        this.noteModal!.componentInstance.modalData = data;

        this.noteModal!.result.then((result: any) => {
          this.onNoteSaveCompleted.emit(result);
        },
          () => {}
        );

      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  openMapModal() {
    const modalRef = this.modalService.open(MapDetailsComponent, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'md',
    });
  }

  openRegistrationModal() {
    if (!this.registrationModal) {
      if (this.loginModal) {
        this.loginModal.close();
        this.loginModal = undefined;
      }
      this.registrationModal = this.modalService.open(RegistrationComponent, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'md'});
    }

    this.registrationModal.result.then(
      () => this.registrationModal = undefined,
      () => this.registrationModal = undefined
    );
  }

  openLoginModal() {
    if (!this.loginModal) {
      if (this.registrationModal) {
        this.registrationModal.close();
        this.registrationModal = undefined;
      }
      this.loginModal = this.modalService.open(LoginComponent, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'md'});
    }

    this.loginModal.result.then(
      () => this.loginModal = undefined,
      () => this.loginModal = undefined
    );
  }

  isLoading(): boolean {
    return this.requestsInProgress > 0;
  }

  startRequest() {
    this.requestsInProgress++;
  }

  endRequest() {
    this.requestsInProgress--;
    if (this.requestsInProgress < 0)
      this.requestsInProgress = 0;
  }

  closeAllUserRelatedModals() {
    if (this.loginModal)
      this.loginModal.close();
    if (this.registrationModal)
      this.registrationModal.close();
    if (this.noteModal)
      this.noteModal.close();
  }
}

