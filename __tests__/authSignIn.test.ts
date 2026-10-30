import { describe, it, expect } from "vitest";
import {
  saveRegisteredUser,
  verifyUserSignIn,
  findRegisteredUser,
} from "@/lib/data/userAccountStore";

describe("Authentication Sign-In Verification", () => {
  it("throws / returns NOT_REGISTERED with the right message when a user has not signed in previously", async () => {
    const unknownEmail = `unregistered_${Date.now()}@example.com`;
    const result = await verifyUserSignIn(unknownEmail, "SomePassword123");

    expect(result.status).toBe("NOT_REGISTERED");
    if (result.status === "NOT_REGISTERED") {
      expect(result.message).toContain(
        "We couldn't find an account with this email or phone number"
      );
    }
  });

  it("grants access when a user has registered / signed in previously with valid credentials", async () => {
    const email = `trader_${Date.now()}@moniepay.app`;
    await saveRegisteredUser({
      id: "usr_test_trader_01",
      email,
      phone: "08099887766",
      name: "Chinedu Okafor",
      businessName: "Chinedu Wholesale Hub",
      marketLocation: "Onitsha Main Market",
      password: "MyShopPassword2026!",
    });

    const found = await findRegisteredUser(email);
    expect(found).not.toBeNull();
    expect(found?.businessName).toBe("Chinedu Wholesale Hub");

    const loginRes = await verifyUserSignIn(email, "MyShopPassword2026!");
    expect(loginRes.status).toBe("SUCCESS");
    if (loginRes.status === "SUCCESS") {
      expect(loginRes.user.name).toBe("Chinedu Okafor");
      expect(loginRes.user.email).toBe(email);
    }
  });

  it("returns INVALID_PASSWORD with the right message when a previously signed-in user enters the wrong password", async () => {
    const email = `trader_wrongpass_${Date.now()}@moniepay.app`;
    await saveRegisteredUser({
      id: "usr_test_trader_02",
      email,
      name: "Amina Yusuf",
      businessName: "Amina Textiles",
      password: "CorrectPassword123",
    });

    const loginRes = await verifyUserSignIn(email, "WrongPassword999");
    expect(loginRes.status).toBe("INVALID_PASSWORD");
    if (loginRes.status === "INVALID_PASSWORD") {
      expect(loginRes.message).toContain("Wrong password. Please check your password and try again.");
    }
  });
});

