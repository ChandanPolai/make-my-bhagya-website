import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from '../../website/hero/hero.component';
import { AboutComponent } from '../../website/about/about.component';
import { ServicesComponent } from '../../website/services/services.component';
import { TestimonialsComponent } from '../../website/testimonials/testimonials.component';
import { FooterComponent } from '../../website/footer/footer.component';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-website-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeroComponent,
    AboutComponent,
    ServicesComponent,
    TestimonialsComponent,
    FooterComponent
  ],
  templateUrl: './website-main-layout.component.html',
  styleUrl: './website-main-layout.component.scss'
})
export class WebsiteMainLayoutComponent {

    constructor(
      public themeService: ThemeService,
    ) {
    
    }
  isMenuOpen = false;
  isScrolled = false;

  ngOnInit() {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.isMenuOpen = false;
    }
  }
}