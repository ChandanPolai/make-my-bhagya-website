import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';

// Register Swiper web components
register();

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {
  @ViewChild('swiper') swiperRef!: ElementRef;

  isMenuOpen = false;
  isScrolled = false;

  swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
      dynamicBullets: true,
    },
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    speed: 1000,
  };

  ngOnInit() {
    // Scroll listener for navbar shadow
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });

    // Listen for footer/global navigation events
    document.addEventListener('scrollToSection', (e: any) => {
      const section = e?.detail as 'home' | 'about' | 'services' | 'testimonials';
      if (section) {
        this.scrollToSection(section);
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onNavClick(event: Event, section: 'home' | 'about' | 'services' | 'testimonials', fromDrawer: boolean = false) {
    event.preventDefault();
    if (fromDrawer) {
      this.closeMenu();
      // Delay to allow drawer close animation before scrolling
      setTimeout(() => this.scrollToSection(section), 180);
    } else {
      this.scrollToSection(section);
    }
  }

  private scrollToSection(section: 'home' | 'about' | 'services' | 'testimonials') {
    const headerOffset = 80; // approximate sticky header height
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    let selector = '';
    if (section === 'about') selector = 'app-about';
    if (section === 'services') selector = 'app-services';
    if (section === 'testimonials') selector = 'app-testimonials';

    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;

    const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetTop = elementTop - headerOffset;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  }

  nextSlide() {
    this.swiperRef.nativeElement.swiper.slideNext();
  }

  previousSlide() {
    this.swiperRef.nativeElement.swiper.slidePrev();
  }
}