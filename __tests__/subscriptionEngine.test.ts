import { describe, it, expect } from "vitest";
import { calculateSubscriptionDetails } from "@/lib/subscription";

describe("Subscription & Free Trial Engine — Calendar Day Accuracy", () => {
  it("accurately progresses through each calendar day of the 7-day trial", () => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Day 1 (trial just started: 7 days remaining)
    const day1Created = new Date(now).toISOString();
    const day1End = new Date(now + 7 * oneDayMs).toISOString();
    const day1Details = calculateSubscriptionDetails({
      createdAt: day1Created,
      trialEndsAt: day1End,
      subscriptionStatus: "trialing",
    });
    expect(day1Details.isTrialActive).toBe(true);
    expect(day1Details.trialDaysLeft).toBe(7);
    expect(7 - day1Details.trialDaysLeft + 1).toBe(1); // Day 1 of 7

    // Day 2 (1 day elapsed: 6 days remaining)
    const day2End = new Date(now + 6 * oneDayMs - 1000).toISOString();
    const day2Details = calculateSubscriptionDetails({
      trialEndsAt: day2End,
      subscriptionStatus: "trialing",
    });
    expect(day2Details.isTrialActive).toBe(true);
    expect(day2Details.trialDaysLeft).toBe(6);
    expect(7 - day2Details.trialDaysLeft + 1).toBe(2); // Day 2 of 7

    // Day 5 (3 days have elapsed since Day 2, so 4 days elapsed total: 3 days remaining)
    const day5End = new Date(now + 3 * oneDayMs - 1000).toISOString();
    const day5Details = calculateSubscriptionDetails({
      trialEndsAt: day5End,
      subscriptionStatus: "trialing",
    });
    expect(day5Details.isTrialActive).toBe(true);
    expect(day5Details.trialDaysLeft).toBe(3);
    expect(7 - day5Details.trialDaysLeft + 1).toBe(5); // Day 5 of 7

    // Day 7 (final day: 1 day remaining)
    const day7End = new Date(now + 0.5 * oneDayMs).toISOString();
    const day7Details = calculateSubscriptionDetails({
      trialEndsAt: day7End,
      subscriptionStatus: "trialing",
    });
    expect(day7Details.isTrialActive).toBe(true);
    expect(day7Details.trialDaysLeft).toBe(1);
    expect(7 - day7Details.trialDaysLeft + 1).toBe(7); // Day 7 of 7

    // Trial expired 1 day ago -> enters 3-day Grace Period
    const graceEnd = new Date(now - 1 * oneDayMs).toISOString();
    const graceDetails = calculateSubscriptionDetails({
      trialEndsAt: graceEnd,
      subscriptionStatus: "trialing",
    });
    expect(graceDetails.isTrialActive).toBe(false);
    expect(graceDetails.isGracePeriodActive).toBe(true);
    expect(graceDetails.status).toBe("grace_period");
    expect(graceDetails.graceDaysLeft).toBe(2); // 2 days of grace left
  });

  it("accurately isolates and calculates trial days for multiple distinct users", async () => {
    const { getPersistedTrialDates } = await import("@/lib/data/trialPersistence");

    // 1. Demo user baseline (4 days elapsed -> 3 days remaining = Day 5 of 7)
    const demoTrial = getPersistedTrialDates("user_owner_01");
    const demoDetails = calculateSubscriptionDetails({
      createdAt: demoTrial.createdAt,
      trialEndsAt: demoTrial.trialEndsAt,
      subscriptionStatus: demoTrial.subscriptionStatus,
    });
    expect(demoDetails.trialDaysLeft).toBe(3);
    expect(7 - demoDetails.trialDaysLeft + 1).toBe(5);

    // 2. Newly registered trader (today) -> gets 7 full days
    const newTraderTrial = getPersistedTrialDates("new_trader_test_99", new Date());
    const newTraderDetails = calculateSubscriptionDetails({
      createdAt: newTraderTrial.createdAt,
      trialEndsAt: newTraderTrial.trialEndsAt,
      subscriptionStatus: newTraderTrial.subscriptionStatus,
    });
    expect(newTraderDetails.trialDaysLeft).toBe(7);
    expect(7 - newTraderDetails.trialDaysLeft + 1).toBe(1);

    // 3. Independent user registered 2 days ago -> Day 3 of 7 (5 days left)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const existingTraderTrial = getPersistedTrialDates("existing_trader_test_88", twoDaysAgo);
    const existingDetails = calculateSubscriptionDetails({
      createdAt: existingTraderTrial.createdAt,
      trialEndsAt: existingTraderTrial.trialEndsAt,
      subscriptionStatus: existingTraderTrial.subscriptionStatus,
    });
    expect(existingDetails.trialDaysLeft).toBe(5);
    expect(7 - existingDetails.trialDaysLeft + 1).toBe(3);
  });
});
