import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  navigate(section: 'home' | 'about' | 'services' | 'testimonials'): void {
    document.dispatchEvent(new CustomEvent('scrollToSection', { detail: section }));
  }
}
