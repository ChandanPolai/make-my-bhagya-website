import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiManagerService } from '../utilities/api-manager';
import { apiEndpoints } from '../constants/api-endpoint';
import {
  PublicService,
  PublicServicesResponse,
  GetPublicServicesRequest
} from '../interfaces/public-services.interface';

@Injectable({
  providedIn: 'root'
})
export class PublicServicesService {
  constructor(private apiManager: ApiManagerService) {}

  /**
   * Get all public services (no authentication required)
   * Fetches only active services for website display
   * @param filters - Optional filters (isActive, limit)
   * @returns Observable of public services array
   */
  getPublicServices(filters?: GetPublicServicesRequest): Observable<PublicServicesResponse> {
    const requestData = {
      isActive: filters?.isActive ?? true, // Default: only active services
      limit: filters?.limit ?? 100         // Default: get up to 100 services
    };
    
    return this.apiManager.post(apiEndpoints.GET_PUBLIC_SERVICES, requestData);
  }

  /**
   * Get all active services (shorthand method)
   * @returns Observable of active public services
   */
  getActiveServices(): Observable<PublicServicesResponse> {
    return this.getPublicServices({ isActive: true });
  }

  /**
   * Get limited number of services (for homepage, etc.)
   * @param limit - Number of services to fetch
   * @returns Observable of limited public services
   */
  getFeaturedServices(limit: number = 3): Observable<PublicServicesResponse> {
    return this.getPublicServices({ isActive: true, limit });
  }
}