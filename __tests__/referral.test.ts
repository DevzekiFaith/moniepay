import { describe, it, expect, beforeEach } from "vitest";
import {
  generateUserReferralCode,
  validateReferralEligibility,
  getReferralStats,
  claimReferralReward,
  generateWhatsAppInviteMessage,
  saveReferredTraders,
  SEED_REFERRED_TRADERS,
} from "@/lib/referral/referralStore";
import { ReferredTrader } from "@/types/referral.types";

describe("MoniePay — Referral & 7-Day Active Trader Reward System", () => {
  beforeEach(() => {
    // Reset seeds
    saveReferredTraders([...SEED_REFERRED_TRADERS]);
  });

  it("1. Generates consistent and clean referral codes for shop owners", () => {
    const code = generateUserReferralCode("Mama Chidi Provisions", "+2348031234567");
    expect(code).toMatch(/^MONIE-MAMAC-67$/);
  });

  it("2. Validates referral eligibility and prevents self-referrals", () => {
    // Valid code
    const valid = validateReferralEligibility({
      referralCode: "MONIE-SEGUN-12",
      userPhone: "+2348029990000",
      referrerPhone: "+2348031112222",
    });
    expect(valid.eligible).toBe(true);

    // Self-referral attempt with identical phone
    const selfRef = validateReferralEligibility({
      referralCode: "MONIE-SEGUN-12",
      userPhone: "+2348031112222",
      referrerPhone: "+2348031112222",
    });
    expect(selfRef.eligible).toBe(false);
    expect(selfRef.reason).toContain("Self-referral");

    // Invalid code format
    const invalidCode = validateReferralEligibility({
      referralCode: "INVALID_CODE",
      userPhone: "+2348029990000",
    });
    expect(invalidCode.eligible).toBe(false);
  });

  it("3. Calculates accurate 7-day referral progress statistics", () => {
    const stats = getReferralStats("Segun Tailor", "+2348031234588");
    expect(stats.total_invited).toBeGreaterThanOrEqual(3);
    expect(stats.active_in_progress).toBeGreaterThanOrEqual(1);
    expect(stats.referral_code).toBeDefined();
    expect(stats.referral_link).toContain(stats.referral_code);
  });

  it("4. Enforces 7 active recording days before reward can be claimed", () => {
    const testTraders: ReferredTrader[] = [
      {
        id: "ref_test_incomplete",
        business_name: "Incomplete Shop",
        owner_name: "Tunde",
        phone_masked: "+234 803 ••• 1111",
        joined_date: new Date().toISOString(),
        active_days_count: 4, // only 4 days
        required_days: 7,
        status: "ACTIVE_RECORDING",
        reward_amount: 500,
        reward_type: "SUBSCRIPTION_EXTENSION",
      },
      {
        id: "ref_test_qualified",
        business_name: "Completed Shop",
        owner_name: "Amaka",
        phone_masked: "+234 802 ••• 2222",
        joined_date: new Date().toISOString(),
        active_days_count: 7, // 7 days completed
        required_days: 7,
        status: "QUALIFIED_COMPLETED",
        reward_amount: 500,
        reward_type: "SUBSCRIPTION_EXTENSION",
      },
    ];

    saveReferredTraders(testTraders);

    // Attempt claim on incomplete trader (should fail)
    const failClaim = claimReferralReward("ref_test_incomplete");
    expect(failClaim.success).toBe(false);
    expect(failClaim.message).toContain("7 active days");

    // Attempt claim on qualified trader (should succeed)
    const successClaim = claimReferralReward("ref_test_qualified");
    expect(successClaim.success).toBe(true);
    expect(successClaim.message).toContain("+14 Days");
  });

  it("5. Generates authentic Nigerian market WhatsApp invite copy", () => {
    const msg = generateWhatsAppInviteMessage("MONIE-CHIDI-92", "Mama Chidi");
    const decoded = decodeURIComponent(msg);
    expect(decoded).toContain("Mama Chidi");
    expect(decoded).toContain("MONIE-CHIDI-92");
    expect(decoded).toContain("7 Days Free Full Access");
    expect(decoded).toContain("MoniePay helps you understand your money");
  });
});
