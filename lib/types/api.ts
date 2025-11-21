/**
 * Comprehensive TypeScript types for API responses
 */

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

// Event types
export interface Event {
  _id: string;
  date: Date | string;
  time: string;
  presenter?: string;
  presenterUrl?: string;
  topic: string;
  location: string;
  locationUrl?: string;
  presentations?: Presentation[];
  isVisible: boolean;
  content?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Presentation {
  filename: string;
  data?: Buffer;
  contentType: string;
  size: number;
  uploadedAt: Date | string;
}

export interface EventCreateInput {
  date: string | Date;
  time: string;
  presenter?: string;
  presenterUrl?: string;
  topic: string;
  location: string;
  locationUrl?: string;
  isVisible: boolean;
  content?: string;
}

export interface EventUpdateInput extends Partial<EventCreateInput> {
  presentations?: Presentation[];
}

// Resource types
export interface Resource {
  _id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  featured: boolean;
  order: number;
  isVisible: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ResourceCreateInput {
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  featured?: boolean;
  order?: number;
  isVisible?: boolean;
}

export interface ResourceUpdateInput extends Partial<ResourceCreateInput> {}

// Tech Item types
export interface TechItem {
  _id: string;
  name: string;
  url: string;
  isVisible: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TechItemCreateInput {
  name: string;
  url: string;
  isVisible?: boolean;
}

export interface TechItemUpdateInput extends Partial<TechItemCreateInput> {}

// Auth types
export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
}

export interface AuthPayload {
  authenticated: boolean;
  role: string;
  timestamp: number;
}

// API Response types
export type EventsResponse = ApiResponse<Event[]>;
export type EventResponse = ApiResponse<Event>;
export type ResourcesResponse = ApiResponse<Resource[]>;
export type ResourceResponse = ApiResponse<Resource>;
export type TechItemsResponse = ApiResponse<TechItem[]>;
export type TechItemResponse = ApiResponse<TechItem>;

// Query parameters
export interface EventQueryParams {
  limit?: number;
  admin?: boolean;
}

export interface ResourceQueryParams {
  featured?: boolean;
  limit?: number;
}

export interface TechItemQueryParams {
  limit?: number;
}
