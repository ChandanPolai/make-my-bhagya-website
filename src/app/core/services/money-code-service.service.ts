import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiManagerService } from '../utilities/api-manager';
import { apiEndpoints } from '../constants/api-endpoint';
import {
  GenerateMoneyCodeRequest,
  GenerateMoneyCodeResponse
} from '../interfaces/money-code.interface';

@Injectable({
  providedIn: 'root'
})
export class MoneyCodeService {
  constructor(private apiManager: ApiManagerService) {}

  /**
   * Generate Money Switch Code (Public API - No Auth Required)
   * User fills form and submits to get their money code report
   * @param data - User details and service selection
   * @returns Observable of generated money code data
   */
  generateMoneyCode(data: GenerateMoneyCodeRequest): Observable<GenerateMoneyCodeResponse> {
    return this.apiManager.post(apiEndpoints.GENERATE_MONEY_CODE, data);
  }

  /**
   * Helper: Format Date from Date Picker to DD-MM-YYYY
   * @param date - Date object or string
   * @returns formatted string DD-MM-YYYY
   */
  formatDateToDDMMYYYY(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Helper: Validate Date of Birth Format (DD-MM-YYYY)
   * @param dob - Date string
   * @returns boolean
   */
  validateDateFormat(dob: string): boolean {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(dob);
  }

  /**
   * Helper: Validate Phone Number (10 digits)
   * @param phone - Phone string
   * @returns boolean
   */
  validatePhoneFormat(phone: string): boolean {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  }

  /**
   * Helper: Validate Email Format
   * @param email - Email string
   * @returns boolean
   */
  validateEmailFormat(email: string): boolean {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
  }

  /**
   * Helper: Get full report URL
   * @param reportPath - Relative path from API
   * @returns Full URL
   */
  getReportUrl(reportPath: string): string {
    const baseUrl = 'http://localhost:7026'; // Replace with actual backend URL
    return `${baseUrl}${reportPath}`;
  }

  /**
   * Helper: Download PDF Report
   * @param reportUrl - Full URL to PDF
   * @param fileName - File name for download
   */
  downloadReport(reportUrl: string, fileName: string = 'money-code-report.pdf'): void {
    const link = document.createElement('a');
    link.href = reportUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}