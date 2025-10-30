// Public Service Interface (for website display)
export interface PublicService {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// API Response Interface
export interface PublicServicesResponse {
  message: string;
  data: PublicService[];
  status: number;
}

// Request Interface (optional filters)
export interface GetPublicServicesRequest {
  isActive?: boolean; // Only get active services
  limit?: number;     // Limit number of results
}