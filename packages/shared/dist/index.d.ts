export declare enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    BUSINESS_OWNER = "BUSINESS_OWNER",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    AGENT = "AGENT"
}
export declare enum PlanTier {
    TRIAL = "TRIAL",
    PRO = "PRO",
    MAX = "MAX"
}
export declare enum SubscriptionStatus {
    TRIALING = "TRIALING",
    ACTIVE = "ACTIVE",
    PAST_DUE = "PAST_DUE",
    CANCELLED = "CANCELLED",
    SUSPENDED = "SUSPENDED"
}
export declare enum ConversationMode {
    AI = "AI",
    HUMAN = "HUMAN",
    PAUSED = "PAUSED"
}
export declare enum OrderStatus {
    NEW = "NEW",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    PACKED = "PACKED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare enum FeatureKey {
    VOICE_AI = "VOICE_AI",
    VISION_AI = "VISION_AI",
    CAMPAIGNS = "CAMPAIGNS",
    ADVANCED_ANALYTICS = "ADVANCED_ANALYTICS",
    API_ACCESS = "API_ACCESS",
    MULTI_WHATSAPP = "MULTI_WHATSAPP"
}
export declare const PLAN_LIMITS: {
    TRIAL: {
        aiReplies: number;
        whatsAppAccounts: number;
        products: number;
        teamMembers: number;
        voiceAi: boolean;
        visionAi: boolean;
        campaigns: boolean;
        campaignQuota: number;
        advancedAnalytics: boolean;
        apiAccess: boolean;
    };
    PRO: {
        aiReplies: number;
        whatsAppAccounts: number;
        products: number;
        teamMembers: number;
        voiceAi: boolean;
        visionAi: boolean;
        campaigns: boolean;
        campaignQuota: number;
        advancedAnalytics: boolean;
        apiAccess: boolean;
    };
    MAX: {
        aiReplies: number;
        whatsAppAccounts: number;
        products: number;
        teamMembers: number;
        voiceAi: boolean;
        visionAi: boolean;
        campaigns: boolean;
        campaignQuota: number;
        advancedAnalytics: boolean;
        apiAccess: boolean;
    };
};
export declare enum ErrorCode {
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    TENANT_ACCESS_DENIED = "TENANT_ACCESS_DENIED",
    PLAN_LIMIT_REACHED = "PLAN_LIMIT_REACHED",
    FEATURE_NOT_AVAILABLE = "FEATURE_NOT_AVAILABLE",
    WHATSAPP_NOT_CONNECTED = "WHATSAPP_NOT_CONNECTED",
    AI_PROVIDER_ERROR = "AI_PROVIDER_ERROR",
    PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    INVALID_ORDER = "INVALID_ORDER",
    RATE_LIMITED = "RATE_LIMITED"
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
