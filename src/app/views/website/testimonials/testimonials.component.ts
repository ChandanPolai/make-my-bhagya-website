import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';

// register swiper web components
register();

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  testimonials = [
    {
      name: 'Aarav Gupta',
      role: 'Entrepreneur',
      text:
        'I followed the Money Switch Code rituals for 45 days. Sales picked up, I closed two big clients, and more importantly my daily decision-making became calmer and sharper. The plan is simple and practical — it removed the guesswork from what to do next.',
      avatar: 'https://www.entrepreneur.com/wp-content/uploads/sites/2/2024/07/1720530731-ent24-julyaugust-franchisee-mw.jpg?resize=500,282',
      rating: 5,
    },
    {
      name: 'Ishita Mehta',
      role: 'Designer',
      text:
        'Beautifully designed report with clear, actionable steps. Within a month I felt more aligned and confident about my finances. The daily code routine is short but powerful and fits easily into my morning schedule.',
      avatar: 'https://www.entrepreneur.com/wp-content/uploads/sites/2/2024/07/1720530731-ent24-julyaugust-franchisee-mw.jpg?resize=500,282',
      rating: 5,
    },
    {
      name: 'Rahul Verma',
      role: 'Consultant',
      text:
        'Skeptical at first, but the numerology mapping made practical sense. Cashflow stabilized after I implemented the daily code and weekly ritual. It gave me a rhythm — small, consistent actions that added up.',
      avatar: 'https://www.entrepreneur.com/wp-content/uploads/sites/2/2024/07/1720530731-ent24-julyaugust-franchisee-mw.jpg?resize=500,282',
      rating: 4,
    },
    {
      name: 'Neha Sharma',
      role: 'Freelancer',
      text:
        'The personalized codes and doables were surprisingly simple. I loved the clarity and the personal examples in the report. I refer to it before important calls to keep my energy clean and focused.',
      avatar: 'https://www.entrepreneur.com/wp-content/uploads/sites/2/2024/07/1720530731-ent24-julyaugust-franchisee-mw.jpg?resize=500,282',
      rating: 5,
    },
  ];

  swiperConfig: any = {
    slidesPerView: 1,
    spaceBetween: 40,
    loop: true,
    autoplay: { delay: 3500, disableOnInteraction: false },
    pagination: { clickable: true, dynamicBullets: true },
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 1 },
      1024: { slidesPerView: 1 },
    },
    speed: 600,
  };
}
