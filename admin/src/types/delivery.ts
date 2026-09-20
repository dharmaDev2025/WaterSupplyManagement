export interface DeliveryCustomer {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface DeliveryAddress {
  houseNo?: string;
  street?: string;
  area?: string;
  city?: string;
  pincode?: string;
}

export interface DeliveryLocation {
  latitude?: number;
  longitude?: number;
}

export interface ProductSummary {
  _id?: string;
  name?: string;
  productType?: string;
  size?: number;
  unit?: string;
}

export interface OrderItem {
  _id?: string;
  product?: ProductSummary;
  name?: string;
  purchaseType?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface DeliveryOrder {
  _id: string;
  orderNumber: string;
  customer: DeliveryCustomer | null;
  deliveryAddress?: DeliveryAddress;
  deliveryLocation?: DeliveryLocation;
  totalAmount: number;
  status: "confirmed" | "packed" | "out-for-delivery" | "delivered" | string;
  paymentStatus?: string;
  createdAt: string;
  deliveredAt?: string;
  deliveryBoyAssignedAt?: string;
}

export interface DeliveryOrderDetailsData {
  id: string;
  orderNumber: string;
  customer: DeliveryCustomer;
  deliveryAddress: DeliveryAddress;
  deliveryLocation: DeliveryLocation;
  mapUrl?: string | null;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  status: "confirmed" | "packed" | "out-for-delivery" | "delivered" | string;
  assignedAt?: string;
  createdAt?: string;
  deliveredAt?: string;
}

export interface DeliveryBoyProfile {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  isActive?: boolean;
}
