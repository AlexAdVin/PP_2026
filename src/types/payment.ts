export type PaymentMethodType = "apple_pay" | "mobilepay" | "card";

export type PaymentMethodSelection = {
  methodType: PaymentMethodType;
  label: string;
  provider: string;
  walletProvider: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpMonth: number | null;
  cardExpYear: number | null;
  cardholderName: string | null;
  mobilepayPhoneLast4: string | null;
  mobilepayProfileName: string | null;
  providerCustomerId?: string | null;
  providerPaymentMethodId?: string | null;
  billingCountry?: string | null;
  fingerprint?: string | null;
  metadata?: Record<string, unknown>;
};