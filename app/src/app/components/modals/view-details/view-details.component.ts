import { Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.scss']
})

export class ViewDetailsComponent implements OnInit{
  @Input() modalData: any[] = [];
  note: any[] = [];

  constructor(public activeModal: NgbActiveModal, private apiService: ApiService, private authService: AuthService) { }
  
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.note = [];

      this.apiService.getNote(this.authService.getUserName()!, this.modalData[0].ada).subscribe({
        next: (data) => {
          if (data.length > 0) {
            if (data[0].note)
              this.note = data;
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  // Open the pdf in a new window
  onOpenPdfButtonClick(url: string) {
    window.open(`${url}?inline=true`, '_blank');
  }

  // Open metadata from diavgeia.gov.gr in a new window
  onMetaDataButtonClick(ada: string) {
    window.open(`https://diavgeia.gov.gr/luminapi/api/decisions/${ada}`);
  }

  // Check if there is a pdf_url
  hasPdfUrl(): boolean {
    return ((this.modalData[0].pdf_url != null) && (this.modalData[0].pdf_url != ""));
  }

  // Translate the status to Greek
  translateStatus(): string {
    if (this.modalData[0].status == "PUBLISHED")
      return "ΑΝΑΡΤΗΘΕΙΣΑ"
    else
      return "ΑΝΑΚΛΗΘΕΙΣΑ"
  }

  // Translate suspicious status
  translateSuspicious(): string {
    if (this.modalData[0].suspicious == 0)
      return "ΑΞΙΟΠΙΣΤΑ"
    else
      return "ΑΜΦΙΣΒΗΤΗΣΙΜΑ"
  }

  // Render HTML as canvas and save it as a .png image
  saveAsImage(): void {
    const modal = document.getElementById('modal');

    html2canvas(modal!).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');

      link.href = imgData;
      link.download = `${this.modalData[0].ada}.png`;
      link.click();
    });
  }
}
