import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'home-page-new',
  templateUrl: 'home-page-new.component.html',
  styleUrls: ['home-page-new.component.scss'],
})
export class HomePageNewComponent implements AfterViewInit {
  @ViewChildren('fadeElements1,fadeElements2,fadeElements3, fadeElements4') fadeElementsRef!: QueryList<ElementRef>;

  ngAfterViewInit() {
    this.fadeElementsRef.changes.subscribe(() => {
      this.applyIntersectionObserver();
    });

    this.applyIntersectionObserver();
  }

  private applyIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    });

    this.fadeElementsRef.forEach((elementRef: ElementRef) => {
      const element = elementRef.nativeElement;
      observer.observe(element);
    });
  }
}
