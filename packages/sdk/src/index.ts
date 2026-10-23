import type {
  AgentSpendingPolicy,
  Money,
  PaymentRailAdapter,
  PaymentRequest,
  PolicyDecision,
} from "@cardano-agent-pay/shared-types";

export interface AgentClientOptions {
  policy: AgentSpendingPolicy;
  adapters: readonly PaymentRailAdapter[];
  fetch?: typeof fetch;
  approve?: (request: PaymentRequest) => Promise<boolean>;
  parsePaymentRequired?: (response: Response) => Promise<PaymentRequest>;
}

export interface FetchWithPaymentOptions extends RequestInit {
  operation?: string;
  recipient?: string;
}

function minorUnits(money: Money): bigint | undefined {
  if (!/^\d+$/.test(money.amount)) return undefined;
  return BigInt(money.amount);
}

/** Pure policy check. Currency mismatches fail closed. */
export function evaluatePolicy(
  policy: AgentSpendingPolicy,
  request: Pick<PaymentRequest, "operation" | "recipient" | "amount">,
): PolicyDecision {
  const amount = minorUnits(request.amount);
  const budget = minorUnits(policy.sessionBudget);
  const spent = minorUnits(policy.spent);
  if (amount === undefined || budget === undefined || spent === undefined) {
    return { outcome: "deny", reason: "invalid_amount" };
  }
  if (request.amount.currency !== policy.sessionBudget.currency || request.amount.currency !== policy.spent.currency) {
    return { outcome: "deny", reason: "currency_mismatch" };
  }
  if (policy.expiresAt) {
    const expiresAt = Date.parse(policy.expiresAt);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return { outcome: "deny", reason: "policy_expired" };
    }
  }
  if (policy.allowedOperations && !policy.allowedOperations.includes(request.operation)) {
    return { outcome: "deny", reason: "operation_not_allowed" };
  }
  if (policy.deniedRecipients?.includes(request.recipient)) {
    return { outcome: "deny", reason: "recipient_denied" };
  }
  if (policy.allowedRecipients && !policy.allowedRecipients.includes(request.recipient)) {
    return { outcome: "deny", reason: "recipient_not_allowed" };
  }
  if (policy.perActionLimit) {
    const limit = minorUnits(policy.perActionLimit);
    if (limit === undefined || policy.perActionLimit.currency !== request.amount.currency) {
      return { outcome: "deny", reason: "invalid_action_limit" };
    }
    if (amount > limit) return { outcome: "deny", reason: "action_limit_exceeded" };
  }
  if (spent + amount > budget) return { outcome: "deny", reason: "session_budget_exceeded" };
  if (policy.humanApprovalAbove) {
    const threshold = minorUnits(policy.humanApprovalAbove);
    if (threshold === undefined || policy.humanApprovalAbove.currency !== request.amount.currency) {
      return { outcome: "deny", reason: "invalid_approval_threshold" };
    }
    if (amount >= threshold) return { outcome: "require_approval", reason: "approval_threshold", amount: request.amount };
  }
  return { outcome: "allow", reason: "within_policy" };
}

export function createAgentClient(options: AgentClientOptions) {
  const requestFetch = options.fetch ?? fetch;

  return {
    async fetchWithPayment(url: string | URL, init: FetchWithPaymentOptions = {}): Promise<Response> {
      const { operation = "http_api", recipient = new URL(url).origin, ...requestInit } = init;
      const firstResponse = await requestFetch(url, requestInit);
      if (firstResponse.status !== 402) return firstResponse;
      if (!options.parsePaymentRequired) {
        throw new Error("HTTP 402 received, but no payment challenge parser is configured.");
      }

      const request = await options.parsePaymentRequired(firstResponse);
      const decision = evaluatePolicy(options.policy, { ...request, operation, recipient });
      if (decision.outcome === "deny") throw new Error(`Payment denied by policy: ${decision.reason}`);
      if (decision.outcome === "require_approval" && !(await options.approve?.(request))) {
        throw new Error("Payment requires explicit human approval.");
      }

      const adapter = await findAdapter(options.adapters, request);
      if (!adapter) throw new Error("No configured payment adapter supports this request.");
      const settlement = await adapter.settle(request, requestInit.signal ?? undefined);
      const paymentHeaders = new Headers(requestInit.headers);
      for (const [name, value] of Object.entries(settlement.paymentHeaders)) paymentHeaders.set(name, value);
      return requestFetch(url, { ...requestInit, headers: paymentHeaders });
    },
  };
}

async function findAdapter(
  adapters: readonly PaymentRailAdapter[],
  request: PaymentRequest,
): Promise<PaymentRailAdapter | undefined> {
  for (const adapter of adapters) if (await adapter.canHandle(request)) return adapter;
  return undefined;
}

export type { AgentSpendingPolicy };
