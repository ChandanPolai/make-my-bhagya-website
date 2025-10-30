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
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  nextSlide() {
    this.swiperRef.nativeElement.swiper.slideNext();
  }

  previousSlide() {
    this.swiperRef.nativeElement.swiper.slidePrev();
  }
}