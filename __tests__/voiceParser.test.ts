import { describe, it, expect } from "vitest";
import { parseSpokenMarketAmount } from "@/lib/voice/spokenParser";

describe("Spoken Market Amount Parser — Voice Recognition Accuracy", () => {
  it("correctly parses 400000 in various spoken and transcript formats", () => {
    // 1. Literal digits
    expect(parseSpokenMarketAmount("400000")).toBe(400000);
    expect(parseSpokenMarketAmount("400000 naira")).toBe(400000);
    expect(parseSpokenMarketAmount("sold goods for 400000")).toBe(400000);

    // 2. Comma-formatted (what browser speech recognition produces)
    expect(parseSpokenMarketAmount("400,000")).toBe(400000);
    expect(parseSpokenMarketAmount("400,000 naira")).toBe(400000);
    expect(parseSpokenMarketAmount("₦400,000")).toBe(400000);
    expect(parseSpokenMarketAmount("sold goods for 400,000")).toBe(400000);
    expect(parseSpokenMarketAmount("sold 5 bags for 400,000")).toBe(400000);

    // 3. Space-separated digits
    expect(parseSpokenMarketAmount("400 000")).toBe(400000);
    expect(parseSpokenMarketAmount("400 000 naira")).toBe(400000);

    // 4. K-suffix and thousand
    expect(parseSpokenMarketAmount("400k")).toBe(400000);
    expect(parseSpokenMarketAmount("400 k")).toBe(400000);
    expect(parseSpokenMarketAmount("400 thousand")).toBe(400000);
    expect(parseSpokenMarketAmount("400 thousand naira")).toBe(400000);

    // 5. English words
    expect(parseSpokenMarketAmount("four hundred thousand")).toBe(400000);
    expect(parseSpokenMarketAmount("four hundred thousand naira")).toBe(400000);
    expect(parseSpokenMarketAmount("sold 3 bags for four hundred thousand")).toBe(400000);
  });

  it("handles other common Nigerian market transaction amounts", () => {
    expect(parseSpokenMarketAmount("45k")).toBe(45000);
    expect(parseSpokenMarketAmount("twenty thousand")).toBe(20000);
    expect(parseSpokenMarketAmount("20,000 naira")).toBe(20000);
    expect(parseSpokenMarketAmount("1.5 million")).toBe(1500000);
    expect(parseSpokenMarketAmount("1.5m")).toBe(1500000);
    expect(parseSpokenMarketAmount("fifty thousand five hundred")).toBe(50500);
    expect(parseSpokenMarketAmount("10 cartons for 250,000")).toBe(250000);
  });
});
