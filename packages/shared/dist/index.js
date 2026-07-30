"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.PLAN_LIMITS = exports.FeatureKey = exports.OrderStatus = exports.ConversationMode = exports.SubscriptionStatus = exports.PlanTier = exports.Role = void 0;
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["BUSINESS_OWNER"] = "BUSINESS_OWNER";
    Role["ADMIN"] = "ADMIN";
    Role["MANAGER"] = "MANAGER";
    Role["AGENT"] = "AGENT";
})(Role || (exports.Role = Role = {}));
var PlanTier;
(function (PlanTier) {
    PlanTier["TRIAL"] = "TRIAL";
    PlanTier["PRO"] = "PRO";
    PlanTier["MAX"] = "MAX";
})(PlanTier || (exports.PlanTier = PlanTier = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["TRIALING"] = "TRIALING";
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["PAST_DUE"] = "PAST_DUE";
    SubscriptionStatus["CANCELLED"] = "CANCELLED";
    SubscriptionStatus["SUSPENDED"] = "SUSPENDED";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var ConversationMode;
(function (ConversationMode) {
    ConversationMode["AI"] = "AI";
    ConversationMode["HUMAN"] = "HUMAN";
    ConversationMode["PAUSED"] = "PAUSED";
})(ConversationMode || (exports.ConversationMode = ConversationMode = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "NEW";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["PACKED"] = "PACKED";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var FeatureKey;
(function (FeatureKey) {
    FeatureKey["VOICE_AI"] = "VOICE_AI";
    FeatureKey["VISION_AI"] = "VISION_AI";
    FeatureKey["CAMPAIGNS"] = "CAMPAIGNS";
    FeatureKey["ADVANCED_ANALYTICS"] = "ADVANCED_ANALYTICS";
    FeatureKey["API_ACCESS"] = "API_ACCESS";
    FeatureKey["MULTI_WHATSAPP"] = "MULTI_WHATSAPP";
})(FeatureKey || (exports.FeatureKey = FeatureKey = {}));
exports.PLAN_LIMITS = {
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
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["TENANT_ACCESS_DENIED"] = "TENANT_ACCESS_DENIED";
    ErrorCode["PLAN_LIMIT_REACHED"] = "PLAN_LIMIT_REACHED";
    ErrorCode["FEATURE_NOT_AVAILABLE"] = "FEATURE_NOT_AVAILABLE";
    ErrorCode["WHATSAPP_NOT_CONNECTED"] = "WHATSAPP_NOT_CONNECTED";
    ErrorCode["AI_PROVIDER_ERROR"] = "AI_PROVIDER_ERROR";
    ErrorCode["PRODUCT_NOT_FOUND"] = "PRODUCT_NOT_FOUND";
    ErrorCode["OUT_OF_STOCK"] = "OUT_OF_STOCK";
    ErrorCode["INVALID_ORDER"] = "INVALID_ORDER";
    ErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
