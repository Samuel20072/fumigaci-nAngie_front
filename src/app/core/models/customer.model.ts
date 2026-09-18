export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  neighborhood?: string;
  city?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  fullName: string;
  phone: string;
  address: string;
  neighborhood?: string;
  city?: string;
  notes?: string;
}

export interface UpdateCustomerDto {
  fullName?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  notes?: string;
  isActive?: boolean;
}
