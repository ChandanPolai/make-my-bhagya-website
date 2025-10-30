import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicServicesService } from '../../../core/services/public-servies.service';
import { PublicService } from '../../../core/interfaces/public-services.interface';
import { environment } from '../../../../env/env.local';
import { MoneyCodeService } from '../../../core/services/money-code-service.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  services: PublicService[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Default/fallback image when a service image is missing or fails to load
  readonly defaultImage = 'assets/images/011-spirituality.png';

  selectedService: PublicService | null = null;
  isModalOpen = false;

  // Form model
  form = {
    fullName: '',
    dateOfBirth: '', // ISO date from date picker
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    profession: '',
    email: '',
    phone: ''
  };

  errors: { [K in keyof typeof this.form]?: string } = {};
  modalMessage: { type: 'success' | 'error'; text: string } | null = null;

  private razorpayLoaded = false;

  constructor(private publicServices: PublicServicesService, private moneyCode: MoneyCodeService) {}

  ngOnInit(): void {
    this.publicServices.getActiveServices().subscribe({
      next: (res) => {
        // API may return either { data: PublicService[] } or { data: { docs: PublicService[] } }
        const payload: any = res as any;
        const docs: PublicService[] = payload?.data?.docs ?? payload?.data ?? [];
        this.services = Array.isArray(docs) ? docs : [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load services right now.';
        this.isLoading = false;
      },
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.defaultImage) {
      target.src = this.defaultImage;
    }
  }

  getImageUrl(imagePath?: string | null): string {
    if (!imagePath || imagePath.trim() === '') return this.defaultImage;
    const isAbsolute = /^https?:\/\//i.test(imagePath);
    if (isAbsolute) return imagePath;
    const base = environment.imageUrl?.replace(/\/$/, '') ?? '';
    const path = imagePath.replace(/^\//, '');
    return `${base}/${path}`;
  }

  trackByServiceId(index: number, item: PublicService): string {
    return item._id;
  }

  openModal(service: PublicService): void {
    this.selectedService = service;
    this.isModalOpen = true;
    this.loadRazorpayScript();
    this.modalMessage = null;
  }

  closeModal(): void {
    this.isModalOpen = false;
    // reset form and messages
    this.form = { fullName: '', dateOfBirth: '', gender: 'Male', profession: '', email: '', phone: '' };
    this.errors = {};
    this.modalMessage = null;
    this.selectedService = null;
  }

  private loadRazorpayScript(): void {
    if (this.razorpayLoaded) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => (this.razorpayLoaded = true);
    document.body.appendChild(script);
  }

  

  private onPaymentSuccess(resp: any): void {
    if (!this.selectedService) return;
    const dobFormatted = this.moneyCode.formatDateToDDMMYYYY(this.form.dateOfBirth);
    const payload = {
      fullName: this.form.fullName,
      dateOfBirth: dobFormatted, // DD-MM-YYYY
      gender: this.form.gender,
      profession: this.form.profession,
      email: this.form.email,
      phone: this.form.phone,
      serviceId: this.selectedService._id,
      amountPaid: this.selectedService.price,
      paymentId: resp?.razorpay_payment_id || null,
      orderId: resp?.razorpay_order_id || null,
    };

    this.moneyCode.generateMoneyCode(payload as any).subscribe({
      next: () => {
        this.closeModal();
      },
      error: () => {
        this.closeModal();
      }
    });
  }

  // Validate form and set inline error messages
  isFormValid(): boolean {
    this.errors = {};
    if (!this.form.fullName.trim()) {
      this.errors.fullName = 'Full name is required';
    }
    if (!this.form.dateOfBirth) {
      this.errors.dateOfBirth = 'Date of birth is required';
    }
    if (!this.moneyCode.validateEmailFormat(this.form.email)) {
      this.errors.email = 'Enter a valid email address';
    }
    if (!this.moneyCode.validatePhoneFormat(this.form.phone)) {
      this.errors.phone = 'Enter a valid 10-digit phone number';
    }
    return Object.keys(this.errors).length === 0;
  }

  sanitizePhoneInput(): void {
    this.form.phone = (this.form.phone || '').replace(/\D/g, '').slice(0, 10);
  }

  blockNonDigits(event: KeyboardEvent): void {
    const key = event.key;
    // Allow control keys
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowed.includes(key)) return;
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
    }
    // Enforce 10 digits
    if (this.form.phone && this.form.phone.length >= 10) {
      event.preventDefault();
    }
  }

  canPay(): boolean {
    const nameOk = !!this.form.fullName.trim();
    const dobOk = !!this.form.dateOfBirth;
    const emailOk = this.moneyCode.validateEmailFormat(this.form.email);
    const phoneOk = this.moneyCode.validatePhoneFormat(this.form.phone);
    return nameOk && dobOk && emailOk && phoneOk;
  }

  // Re-add payNow to launch Razorpay when form is valid
  payNow(): void {
    if (!this.selectedService) return;
    if (!this.isFormValid()) return;
    const amountPaise = Math.max(1, Math.round((this.selectedService.price || 0) * 100));

    const options: any = {
      key: 'rzp_test_huTmioKmO2Z4SA',
      amount: amountPaise,
      currency: 'INR',
      name: 'Make My Bhagya',
      description: this.selectedService.title,
      image: this.getImageUrl(this.selectedService.image),
      handler: (response: any) => this.onPaymentSuccess(response),
      prefill: { name: this.form.fullName, email: this.form.email, contact: this.form.phone },
      theme: { color: '#560591' },
    };

    const rzCtor = (window as any).Razorpay;
    if (!rzCtor) return;
    const rz = new rzCtor(options);
    rz.open();
  }
}
