export interface AiContext {
  businessId: string;
  customerId: string;
  conversationId: string;
  customerName?: string;
  customerPhone?: string;
  aiName?: string;
  welcomeMessage?: string;
  tone?: string;
  recentMessages?: { sender: string; content: string }[];
  audioBuffer?: Buffer;
  audioMimeType?: string;
}

export interface AiResponse {
  replyText: string;
  toolsUsed?: string[];
  orderCreated?: any;
  productImageUrl?: string | null;
  inputTokens: number;
  outputTokens: number;
}

export interface AIProvider {
  generateResponse(userMessage: string, context: AiContext): Promise<AiResponse>;
}
