import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicServicesService } from '../../../core/services/public-servies.service';
import { PublicService } from '../../../core/interfaces/public-services.interface';
import { environment } from '../../../../env/env.local';
import { MoneyCodeService } from '../../../core/services/money-code-service.service';
import { debounceTime, Subject } from 'rxjs';

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
  isCheckingDuplicate = false;

  // Duplicate check flags
  isDuplicateEmail = false;
  isDuplicatePhone = false;

  generatedData: any = null;

  private razorpayLoaded = false;
  private emailCheckSubject = new Subject<string>();
  private phoneCheckSubject = new Subject<string>();

  constructor(
    private publicServices: PublicServicesService, 
    public moneyCode: MoneyCodeService
  ) {
    // Debounce email check (wait 800ms after user stops typing)
    this.emailCheckSubject.pipe(debounceTime(800)).subscribe(email => {
      if (email && this.moneyCode.validateEmailFormat(email) && this.isValidEmailDomain(email)) {
        this.checkEmailDuplicate(email);
      }
    });

    // Debounce phone check (wait 800ms after user stops typing)
    this.phoneCheckSubject.pipe(debounceTime(800)).subscribe(phone => {
      if (phone && this.moneyCode.validatePhoneFormat(phone)) {
        this.checkPhoneDuplicate(phone);
      }
    });
  }

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
    this.isDuplicateEmail = false;
    this.isDuplicatePhone = false;
  }

  private loadRazorpayScript(): void {
    if (this.razorpayLoaded) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => (this.razorpayLoaded = true);
    document.body.appendChild(script);
  }

  // Check Email Duplicate
  onEmailChange(): void {
    this.isDuplicateEmail = false;
    this.errors.email = '';
    this.emailCheckSubject.next(this.form.email);
  }

  private checkEmailDuplicate(email: string): void {
    this.isCheckingDuplicate = true;
    
    this.moneyCode.checkDuplicate({ 
      email: email.toLowerCase(), 
      phone: this.form.phone || '0000000000' // dummy phone for email-only check
    }).subscribe({
      next: () => {
        this.isDuplicateEmail = false;
        this.isCheckingDuplicate = false;
      },
      error: (error) => {
        this.isCheckingDuplicate = false;
        if (error?.status === 409) {
          this.isDuplicateEmail = true;
          this.errors.email = 'This email address is already registered';
        }
      }
    });
  }

  // Check Phone Duplicate
  onPhoneChange(): void {
    this.isDuplicatePhone = false;
    this.errors.phone = '';
    this.phoneCheckSubject.next(this.form.phone);
  }

  private checkPhoneDuplicate(phone: string): void {
    this.isCheckingDuplicate = true;
    
    this.moneyCode.checkDuplicate({ 
      email: this.form.email || 'temp@example.com', // dummy email for phone-only check
      phone: phone
    }).subscribe({
      next: () => {
        this.isDuplicatePhone = false;
        this.isCheckingDuplicate = false;
      },
      error: (error) => {
        this.isCheckingDuplicate = false;
        if (error?.status === 409) {
          this.isDuplicatePhone = true;
          this.errors.phone = 'This mobile number is already registered';
        }
      }
    });
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
        
        // Enhanced success message with codes info
        const codes = response.data.moneyCodes;
        const codesText = codes?.shortTerm 
          ? `Short-Term: ${codes.shortTerm}, Mid-Term: ${codes.midTerm}, Long-Term: ${codes.longTerm}`
          : codes?.daily 
            ? `Daily: ${codes.daily}, Wealth: ${codes.wealth}, Luxury: ${codes.luxury}, Master: ${codes.master}`
            : '';
        
        this.modalMessage = { 
          type: 'success', 
          text: `✅ Success! Your Money Switch Code has been generated and sent to your email. ${codesText ? 'Your codes: ' + codesText : ''}` 
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

    if (!this.form.dateOfBirth) {
      this.errors.dateOfBirth = 'Date of birth is required';
      isValid = false;
    }

    if (!this.form.email.trim()) {
      this.errors.email = 'Email is required';
      isValid = false;
    } else if (!this.moneyCode.validateEmailFormat(this.form.email)) {
      this.errors.email = 'Enter a valid email address';
      isValid = false;
    } else if (!this.isValidEmailDomain(this.form.email)) {
      this.errors.email = 'Please enter a valid email domain (e.g., .com, .in, .org)';
      isValid = false;
    } else if (this.isDuplicateEmail) {
      this.errors.email = 'This email address is already registered';
      isValid = false;
    }

    if (!this.form.phone.trim()) {
      this.errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!this.moneyCode.validatePhoneFormat(this.form.phone)) {
      this.errors.phone = 'Enter a valid 10-digit phone number';
      isValid = false;
    } else if (this.isDuplicatePhone) {
      this.errors.phone = 'This mobile number is already registered';
      isValid = false;
    }

    return isValid;
  }

  sanitizePhoneInput(): void {
    this.form.phone = (this.form.phone || '').replace(/\D/g, '').slice(0, 10);
    this.onPhoneChange(); // Trigger duplicate check
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
    this.onPhoneChange();
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
    // Disable if submitting or checking duplicate or if duplicate exists
    if (this.isSubmitting || this.isCheckingDuplicate || this.isDuplicateEmail || this.isDuplicatePhone) {
      return false;
    }
    
    const nameOk = !!this.form.fullName.trim() && 
                   /^[a-zA-Z\s]+$/.test(this.form.fullName) &&
                   this.form.fullName.trim().length >= 3;
    const dobOk = !!this.form.dateOfBirth;
    const emailOk = this.moneyCode.validateEmailFormat(this.form.email) && 
                    this.isValidEmailDomain(this.form.email);
    const phoneOk = this.moneyCode.validatePhoneFormat(this.form.phone);
    
    return nameOk && dobOk && emailOk && phoneOk;
  }

  private isValidEmailDomain(email: string): boolean {
    if (!email || !email.trim()) return false;
    const trimmedEmail = email.trim().toLowerCase();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return false;
    
    const domainPart = trimmedEmail.split('@')[1];
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

  downloadReport(): void {
    if (this.generatedData?.reportUrl) {
      const reportUrl = this.moneyCode.getReportUrl(this.generatedData.reportUrl);
      window.open(reportUrl, '_blank');
    }
  }
}