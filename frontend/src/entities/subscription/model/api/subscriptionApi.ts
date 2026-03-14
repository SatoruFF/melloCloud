import { rtkApi } from '../../../../shared/api/rtkApi';
import { ApiPaths } from '../../../../shared/consts/localVariables';

export interface SubscriptionConfig {
  isEnabled: boolean;
  freeStorageBytes: string;
  freeMaxNotes: number;
  freeMaxCollaborators: number;
  freeVideoCall: boolean;
  proPriceUsd: number;
  proPriceRub: number;
  proStorageBytes: string;
  proMaxNotes: number;
  proMaxCollaborators: number;
  proVideoCall: boolean;
  enterprisePriceUsd: number;
  enterprisePriceRub: number;
  enterpriseStorageBytes: string;
  enterpriseMaxNotes: number;
  enterpriseMaxCollaborators: number;
  enterpriseVideoCall: boolean;
}

export interface PaymentHistoryItem {
  id: string;
  plan: string;
  provider: string;
  status: string;
  amountUsd: number | null;
  amountRub: number | null;
  currency: string;
  periodMonths: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreatePaymentResponse {
  url: string;
}

export const subscriptionApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getSubscriptionConfig: build.query<SubscriptionConfig, void>({
      query: () => ApiPaths.paymentConfig,
      providesTags: ['SubscriptionConfig'],
    }),
    getPaymentHistory: build.query<PaymentHistoryItem[], void>({
      query: () => ApiPaths.paymentHistory,
      providesTags: ['PaymentHistory'],
    }),
    createStripePayment: build.mutation<
      CreatePaymentResponse,
      { plan: 'PRO' | 'ENTERPRISE'; periodMonths: number; currency: 'usd' | 'rub' }
    >({
      query: (body) => ({
        url: ApiPaths.paymentStripe,
        method: 'POST',
        body,
      }),
    }),
    createYookassaPayment: build.mutation<
      CreatePaymentResponse,
      { plan: 'PRO' | 'ENTERPRISE'; periodMonths: number }
    >({
      query: (body) => ({
        url: ApiPaths.paymentYookassa,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetSubscriptionConfigQuery,
  useGetPaymentHistoryQuery,
  useCreateStripePaymentMutation,
  useCreateYookassaPaymentMutation,
} = subscriptionApi;
