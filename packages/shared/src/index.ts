export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
}

export enum PlanTier {
  TRIAL = 'TRIAL',
  PRO = 'PRO',
  MAX = 'MAX',
}

export enum SubscriptionStatus {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

export enum ConversationMode {
  AI = 'AI',
  HUMAN = 'HUMAN',
  PAUSED = 'PAUSED',
}

export enum OrderStatus {
  NEW = 'NEW',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum FeatureKey {
  VOICE_AI = 'VOICE_AI',
  VISION_AI = 'VISION_AI',
  CAMPAIGNS = 'CAMPAIGNS',
  ADVANCED_ANALYTICS = 'ADVANCED_ANALYTICS',
  API_ACCESS = 'API_ACCESS',
  MULTI_WHATSAPP = 'MULTI_WHATSAPP',
}

export const PLAN_LIMITS = {
  [PlanTier.TRIAL]: {
    aiReplies: 200,
    whatsAppAccounts: 1,
    products: 50,
    teamMembers: 1,
    voiceAi: false,
    visionAi: false,
    campaigns: false,
    campaignQuota: 0,
    advancedAnalytics: false,
    apiAccess: false,
  },
  [PlanTier.PRO]: {
    aiReplies: 5000,
    whatsAppAccounts: 1,
    products: 1000,
    teamMembers: 3,
    voiceAi: true,
    visionAi: true,
    campaigns: true,
    campaignQuota: 1000,
    advancedAnalytics: false,
    apiAccess: false,
  },
  [PlanTier.MAX]: {
    aiReplies: 20000,
    whatsAppAccounts: 3,
    products: 999999,
    teamMembers: 10,
    voiceAi: true,
    visionAi: true,
    campaigns: true,
    campaignQuota: 10000,
    advancedAnalytics: true,
    apiAccess: true,
  },
};

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TENANT_ACCESS_DENIED = 'TENANT_ACCESS_DENIED',
  PLAN_LIMIT_REACHED = 'PLAN_LIMIT_REACHED',
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
  WHATSAPP_NOT_CONNECTED = 'WHATSAPP_NOT_CONNECTED',
  AI_PROVIDER_ERROR = 'AI_PROVIDER_ERROR',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  INVALID_ORDER = 'INVALID_ORDER',
  RATE_LIMITED = 'RATE_LIMITED',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode | string;
    message: string;
    details?: any;
  };
  meta?: any;
}
