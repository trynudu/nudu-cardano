export type CurrencyCode = string;

export interface Money {
  /** Integer minor units, encoded as a decimal string for JSON safety. */
  amount: string;
  currency: CurrencyCode;
}

export interface AgentSpendingPolicy {
  id: string;
  version: number;
  sessionBudget: Money;
  spent: Money;
  perActionLimit?: Money;
  humanApprovalAbove?: Money;
  allowedOperations?: readonly string[];
  allowedRecipients?: readonly string[];
  deniedRecipients?: readonly string[];
  expiresAt?: string;
}

export interface X402PaymentOption {
  scheme: string;
  network: string;
  amount: string;
  currency: CurrencyCode;
  payTo: string;
  asset?: string;
  maxTimeoutSeconds?: number;
  extra?: Readonly<Record<string, unknown>>;
}

export interface X402PaymentRequiredPayload {
  x402Version: number;
  resource?: { url: string; description?: string; mimeType?: string };
  accepts: readonly X402PaymentOption[];
  error?: string;
}

export interface CardanoX402Proof {
  network: "mainnet" | "preprod" | "preview" | "custom";
  transactionId: string;
  paymentOption: X402PaymentOption;
  challengeId?: string;
  submittedAt?: string;
  /** Deployment-selected Cardano metadata label; 4020 in the UI is only a demo value. */
  metadataLabel?: number;
}

export interface AuditCommitmentRecord {
  schemaVersion: number;
  algorithm: "blake2b-256";
  commitment: string;
  salt: string;
  domain: string;
  encryptedPayloadRef: string;
  createdAt: string;
  anchor?: { network: string; transactionId: string; metadataLabel?: number };
}

export type PolicyDecision =
  | { outcome: "allow"; reason: "within_policy" }
  | { outcome: "require_approval"; reason: "approval_threshold"; amount: Money }
  | { outcome: "deny"; reason: string };

export interface PaymentRequest {
  operation: string;
  recipient: string;
  amount: Money;
  requestId: string;
  paymentRequired: X402PaymentRequiredPayload;
}

export interface PaymentSettlement {
  proof: CardanoX402Proof | Readonly<Record<string, unknown>>;
  reference: string;
  /** Protocol adapter encodes the proof into the headers required by its x402 implementation. */
  paymentHeaders: Readonly<Record<string, string>>;
}

export interface PaymentRailAdapter {
  readonly id: string;
  canHandle(request: PaymentRequest): boolean | Promise<boolean>;
  settle(request: PaymentRequest, signal?: AbortSignal): Promise<PaymentSettlement>;
}
