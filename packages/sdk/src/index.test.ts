import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePolicy } from "./index.ts";
import type { AgentSpendingPolicy, PaymentRequest } from "@cardano-agent-pay/shared-types";

const policy: AgentSpendingPolicy = {
  id: "test-policy",
  version: 1,
  sessionBudget: { amount: "10000", currency: "USD" },
  spent: { amount: "1000", currency: "USD" },
  perActionLimit: { amount: "7000", currency: "USD" },
  humanApprovalAbove: { amount: "5000", currency: "USD" },
};

function request(amount: string, currency = "USD"): Pick<PaymentRequest, "operation" | "recipient" | "amount"> {
  return { operation: "checkout", recipient: "shop.example", amount: { amount, currency } };
}

test("allows an in-budget action below the approval threshold", () => {
  assert.deepEqual(evaluatePolicy(policy, request("4000")), { outcome: "allow", reason: "within_policy" });
});

test("requires approval above the configured threshold", () => {
  assert.deepEqual(evaluatePolicy(policy, request("6000")), {
    outcome: "require_approval",
    reason: "approval_threshold",
    amount: { amount: "6000", currency: "USD" },
  });
});

test("requires approval at the configured threshold", () => {
  assert.equal(evaluatePolicy(policy, request("5000")).outcome, "require_approval");
});

test("fails closed for invalid amounts, mismatched currency, and expired policies", () => {
  assert.equal(evaluatePolicy(policy, request("1.2")).outcome, "deny");
  assert.equal(evaluatePolicy(policy, request("100", "USDM")).outcome, "deny");
  assert.deepEqual(evaluatePolicy({ ...policy, expiresAt: "not-a-date" }, request("100")), {
    outcome: "deny",
    reason: "policy_expired",
  });
});

test("denies actions that exceed remaining session budget", () => {
  const largerActionLimit = { ...policy, perActionLimit: { amount: "10000", currency: "USD" } };
  assert.deepEqual(evaluatePolicy(largerActionLimit, request("9500")), { outcome: "deny", reason: "session_budget_exceeded" });
});
