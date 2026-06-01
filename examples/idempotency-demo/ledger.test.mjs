import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { recordCommission, ledger, _reset } from "./ledger.mjs";

beforeEach(() => _reset());

// The project's domain contract, expressed as a test. spec-agent's gate runs
// this; the agent cannot say "done" until it holds.
test("commission ledger is idempotent by saleId", () => {
  recordCommission("sale-1", 100);
  recordCommission("sale-1", 100); // retry / duplicate webhook — must be a no-op

  const forSale = ledger().filter((e) => e.saleId === "sale-1");
  assert.equal(forSale.length, 1, "idempotency invariant failed: duplicate ledger entry for sale-1");
});
