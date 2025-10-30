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

  readonly defaultImage = 'assets/images/011-spirituality.png';

  selectedService: PublicService | null = null;
  isModalOpen = false;

  form = {
    fullName: '',
    dateOfBirth: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    profession: '',
    email: '',
    phone: ''
  };

  errors: { [K in keyof typeof this.form]?: string } = {};
  modalMessage: { type: 'success' | 'error'; text: string } | null = null;
  isSubmitting = false;

  // Success response data
  generatedData: any = null;

  private razorpayLoaded = false;

  constructor(
    private publicServices: PublicServicesService, 
    private moneyCode: MoneyCodeService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.publicServices.getActiveServices().subscribe({
      next: (res) => {
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
    this.resetForm();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.selectedService = null;
    this.generatedData = null;
  }

  private resetForm(): void {
    this.form = { 
      fullName: '', 
      dateOfBirth: '', 
      gender: 'Male', 
      profession: '', 
      email: '', 
      phone: '' 
    };
    this.errors = {};
    this.modalMessage = null;
    this.isSubmitting = false;
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
    
    this.isSubmitting = true;
    this.modalMessage = { type: 'success', text: '🔄 Processing your payment...' };

    const dobFormatted = this.moneyCode.formatDateToDDMMYYYY(this.form.dateOfBirth);
    const payload = {
      fullName: this.form.fullName.trim(),
      dateOfBirth: dobFormatted,
      gender: this.form.gender,
      profession: this.form.profession.trim(),
      email: this.form.email.trim().toLowerCase(),
      phone: this.form.phone.trim(),
      serviceId: this.selectedService._id,
      amountPaid: this.selectedService.price,
      paymentId: resp?.razorpay_payment_id || null,
      orderId: resp?.razorpay_order_id || null,
    };

    this.moneyCode.generateMoneyCode(payload as any).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.generatedData = response.data;
        
        this.modalMessage = { 
          type: 'success', 
          text: '✅ Success! Your Money Switch Code has been generated and sent to your email.' 
        };
      },
      error: (error) => {
        this.isSubmitting = false;
        this.modalMessage = { 
          type: 'error', 
          text: error?.error?.message || 'Something went wrong. Please try again.' 
        };
      }
    });
  }

  isFormValid(): boolean {
    this.errors = {};
    let isValid = true;

    // Full Name validation
    if (!this.form.fullName.trim()) {
      this.errors.fullName = 'Full name is required';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(this.form.fullName)) {
      this.errors.fullName = 'Only alphabets and spaces allowed';
      isValid = false;
    } else if (this.form.fullName.trim().length < 3) {
      this.errors.fullName = 'Name must be at least 3 characters';
      isValid = false;
    }

    // Date of Birth validation - ACCEPTS ANY DATE (REMOVED RESTRICTIONS)
    if (!this.form.dateOfBirth) {
      this.errors.dateOfBirth = 'Date of birth is required';
      isValid = false;
    }

    // Email validation with domain check
    if (!this.form.email.trim()) {
      this.errors.email = 'Email is required';
      isValid = false;
    } else if (!this.moneyCode.validateEmailFormat(this.form.email)) {
      this.errors.email = 'Enter a valid email address';
      isValid = false;
    } else if (!this.isValidEmailDomain(this.form.email)) {
      this.errors.email = 'Please enter a valid email domain (e.g., .com, .in, .org)';
      isValid = false;
    }

    // Phone validation
    if (!this.form.phone.trim()) {
      this.errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!this.moneyCode.validatePhoneFormat(this.form.phone)) {
      this.errors.phone = 'Enter a valid 10-digit phone number';
      isValid = false;
    }

    return isValid;
  }

  sanitizePhoneInput(): void {
    this.form.phone = (this.form.phone || '').replace(/\D/g, '').slice(0, 10);
  }

  blockNonDigits(event: KeyboardEvent): void {
    const key = event.key;
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    
    if (allowed.includes(key)) return;
    
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
      return;
    }
    
    if (this.form.phone && this.form.phone.length >= 10) {
      event.preventDefault();
    }
  }

  onPhonePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const numericOnly = pastedText.replace(/\D/g, '').slice(0, 10);
    this.form.phone = numericOnly;
  }

  blockNonAlphabets(event: KeyboardEvent): void {
    const key = event.key;
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', ' '];
    
    if (allowed.includes(key)) return;
    
    if (!/^[a-zA-Z]$/.test(key)) {
      event.preventDefault();
    }
  }

  canPay(): boolean {
    if (this.isSubmitting) return false;
    
    const nameOk = !!this.form.fullName.trim() && 
                   /^[a-zA-Z\s]+$/.test(this.form.fullName) &&
                   this.form.fullName.trim().length >= 3;
    const dobOk = !!this.form.dateOfBirth;
    const emailOk = this.moneyCode.validateEmailFormat(this.form.email) && 
                    this.isValidEmailDomain(this.form.email);
    const phoneOk = this.moneyCode.validatePhoneFormat(this.form.phone);
    
    return nameOk && dobOk && emailOk && phoneOk;
  }

  // Validate that email has proper domain (.com, .in, .org, .net, .co.in, etc.)
  private isValidEmailDomain(email: string): boolean {
    if (!email || !email.trim()) return false;
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check if email has @ and a domain with at least one dot after @
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return false;
    
    // Extract domain part after @
    const domainPart = trimmedEmail.split('@')[1];
    
    // Check if domain ends with common extensions
    const validDomains = ['.com', '.in', '.org', '.net', '.edu', '.gov', '.co.in', '.co', '.io'];
    return validDomains.some(domain => domainPart.endsWith(domain));
  }

  payNow(): void {
    if (!this.selectedService || this.isSubmitting) return;
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
      prefill: { 
        name: this.form.fullName, 
        email: this.form.email, 
        contact: this.form.phone 
      },
      theme: { color: '#560591' },
      modal: {
        ondismiss: () => {
          this.isSubmitting = false;
        }
      }
    };

    const rzCtor = (window as any).Razorpay;
    if (!rzCtor) {
      this.modalMessage = { 
        type: 'error', 
        text: 'Payment gateway not loaded. Please refresh and try again.' 
      };
      return;
    }
    
    const rz = new rzCtor(options);
    rz.open();
  }

  // Download PDF Report
  downloadReport(): void {
    if (this.generatedData?.reportUrl) {
      const reportUrl = this.moneyCode.getReportUrl(this.generatedData.reportUrl);
      window.open(reportUrl, '_blank');
    }
  }
}