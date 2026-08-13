export interface ShippingData {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentData {
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCVV: string;
}
