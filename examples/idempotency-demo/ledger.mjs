// Project contract: the commission ledger MUST be idempotent by saleId.
// Recording the same sale twice (a retry, a duplicate webhook) must NOT
// create a second payout entry.

const entries = [];

export function recordCommission(saleId, amount) {
  // BUG (what the agent shipped): always appends. A duplicate webhook for the
  // same saleId creates a double commission — real money paid twice.
  entries.push({ saleId, amount });
  return entries;
}

export function ledger() {
  return entries;
}

export function _reset() {
  entries.length = 0;
}
