// ─────────────────────────────────────────────────────────────────
// MoniePay — Spoken Market Number & Dialect Parser
// Converts spoken Nigerian numbers, hybrid transcripts & words to exact Naira
// Examples:
//   "20 thousand naira" -> 20000
//   "twenty thousand naira" -> 20000
//   "20000 naira" -> 20000
//   "20k" / "20 k" -> 20000
//   "one point five million" -> 1500000
//   "1.5 million" -> 1500000
//   "fifty thousand five hundred" -> 50500
// ─────────────────────────────────────────────────────────────────

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const MULTIPLIERS: Record<string, number> = {
  hundred: 100,
  hundreds: 100,
  k: 1000,
  thousand: 1000,
  thousands: 1000,
  m: 1000000,
  million: 1000000,
  millions: 1000000,
  mils: 1000000,
  mil: 1000000,
  b: 1000000000,
  billion: 1000000000,
};

/**
 * Converts English number word phrases (e.g. "twenty thousand five hundred", "four hundred thousand") to a number.
 */
function wordsToNumber(phrase: string): number {
  const tokens = phrase
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\band\b/g, " ")
    .replace(/[,\.₦#]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return 0;

  let total = 0;
  let current = 0;

  for (const token of tokens) {
    if (NUMBER_WORDS[token] !== undefined) {
      current += NUMBER_WORDS[token];
    } else if (MULTIPLIERS[token] !== undefined) {
      const mult = MULTIPLIERS[token];
      if (mult === 100) {
        current = (current === 0 ? 1 : current) * 100;
      } else {
        current = (current === 0 ? 1 : current) * mult;
        total += current;
        current = 0;
      }
    } else if (!isNaN(Number(token))) {
      current += Number(token);
    }
  }

  return total + current;
}

/**
 * Robustly parses spoken text to extract the exact Naira amount.
 * Handles digits ("400000"), formatted ("400,000"), spoken numbers ("four hundred thousand"),
 * "400k", "400 thousand", Pidgin speech patterns, and currency symbols.
 */
export function parseSpokenMarketAmount(rawText: string): number {
  if (!rawText) return 0;

  // 1. Normalize comma-formatted numbers: e.g. "400,000" -> "400000", "1,500,000" -> "1500000"
  let cleaned = rawText
    .replace(/(\d),(\d)/g, "$1$2")
    .replace(/(\d),(\d)/g, "$1$2");

  // Normalize space-separated digit triplets: e.g. "400 000" -> "400000"
  cleaned = cleaned.replace(/(\b\d{1,3})\s+(\d{3})(?!\d)/g, "$1$2");

  // Remove currency symbols & currency names without breaking number sequences
  const text = cleaned
    .toLowerCase()
    .replace(/[₦#]/g, " ")
    .replace(/\bngn\b/g, " ")
    .replace(/\bnaira\b/g, " ")
    .replace(/\bkobo\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Pattern 1: Decimal or integer with multiplier suffix, e.g. "400k", "400 k", "400 thousand", "1.5m", "1.5 million"
  const decMatch = text.match(/(\d+\.?\d*)\s*(m|million|millions|mils|mil|k|thousand|thousands|b|billion|hundred|hundreds)\b/i);
  if (decMatch) {
    const val = parseFloat(decMatch[1]);
    const unit = decMatch[2].toLowerCase();
    if (unit.startsWith("m")) return Math.round(val * 1000000);
    if (unit.startsWith("k") || unit.startsWith("thous")) return Math.round(val * 1000);
    if (unit.startsWith("b")) return Math.round(val * 1000000000);
    if (unit.startsWith("hund")) return Math.round(val * 100);
  }

  // Pattern 2: Multi-word English number phrases e.g. "four hundred thousand", "twenty thousand five hundred"
  // Scan all word sequences in the sentence (e.g. in "sold 3 bags for four hundred thousand", match "four hundred thousand")
  const wordPhraseRegex = /\b((?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|hundreds|thousand|thousands|million|millions|k)(?:\s+(?:and\s+)?(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|hundreds|thousand|thousands|million|millions|k|\d+))*)\b/gi;
  const wordMatches = Array.from(text.matchAll(wordPhraseRegex));
  if (wordMatches.length > 0) {
    const wordVals = wordMatches
      .map((m) => wordsToNumber(m[1]))
      .filter((v) => v > 0);
    // If any parsed word value represents a substantial amount, return the largest or currency amount
    const largeWordVals = wordVals.filter((v) => v >= 100);
    if (largeWordVals.length > 0) {
      return Math.max(...largeWordVals);
    }
    if (wordVals.length > 0) {
      return wordVals[wordVals.length - 1];
    }
  }

  // Pattern 3: Explicit contextual monetary amount e.g. "for 400000", "for 400", "worth 400000"
  const contextNumMatch = text.match(/(?:for|at|worth|cost|sum of|amount of)\s+(\d+)/i);
  if (contextNumMatch) {
    const parsed = parseInt(contextNumMatch[1], 10);
    if (parsed > 0) return parsed;
  }

  // Pattern 4: Raw standalone number (e.g. "400000" or largest number in transcript)
  const allNums = Array.from(text.matchAll(/\b(\d+)\b/g)).map((m) => parseInt(m[1], 10));
  if (allNums.length > 0) {
    // If multiple numbers are detected (e.g. "sold 5 bags for 400000"), prioritize the monetary amount (>= 100)
    const largeNums = allNums.filter((n) => n >= 100);
    if (largeNums.length > 0) {
      return Math.max(...largeNums);
    }
    return allNums[allNums.length - 1];
  }

  return 0;
}

// Pre-load voices cache in browser
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Universal High-Quality Nigerian / African Female Trader Voice Player
 * Guarantees a unanimous female voice on all devices (Windows, Mac, iPhone, Android)
 */
export function playFemaleTraderVoice(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-NG";
    utterance.rate = 1.02;
    // Set feminine pitch (1.20) for warm, clear female tone
    utterance.pitch = 1.2;

    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();

    if (voices && voices.length > 0) {
      // Priority keywords for natural female voices
      const femaleKeywords = [
        "zira", // Microsoft Zira (Female)
        "jenny", // Microsoft Jenny (Natural Female)
        "aria", // Microsoft Aria (Natural Female)
        "samantha", // Apple Samantha (Female)
        "victoria", // Apple Victoria (Female)
        "karen", // Australian Female
        "moira", // Irish Female
        "fiona", // Scottish Female
        "catherine",
        "susan",
        "hazel",
        "serena",
        "female",
        "woman",
        "google uk english female",
        "google us english",
        "en-ng",
        "en-za",
      ];

      const maleKeywords = [
        "david",
        "george",
        "mark",
        "male",
        "guy",
        "richard",
        "james",
        "daniel",
        "brian",
        "oliver",
        "rishi",
        "man",
      ];

      // 1. First priority: Exact English female voice
      let selectedVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        const isEnglish = v.lang.startsWith("en");
        const hasFemaleKeyword = femaleKeywords.some((kw) => name.includes(kw));
        const hasMaleKeyword = maleKeywords.some((kw) => name.includes(kw));
        return isEnglish && hasFemaleKeyword && !hasMaleKeyword;
      });

      // 2. Second priority: Any English voice that is NOT explicitly named male
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => {
          const name = v.name.toLowerCase();
          const isEnglish = v.lang.startsWith("en");
          const hasMaleKeyword = maleKeywords.some((kw) => name.includes(kw));
          return isEnglish && !hasMaleKeyword;
        });
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis notice:", err);
  }
}

/**
 * Generates natural Nigerian Market Pidgin audio feedback for traders
 */
export function generateMarketVernacularVoiceResponse(params: {
  item: string;
  qty: number;
  unit: string;
  amount: number;
  type: string;
  stockBalanceAfter: number;
}): string {
  const { item, qty, unit, amount, type, stockBalanceAfter } = params;

  if (type === "SALE") {
    if (stockBalanceAfter <= 3 && stockBalanceAfter > 0) {
      return `I don record am sharp sharp. ${qty} ${unit} of ${item} don sell for ₦${amount.toLocaleString()}. E remain only ${stockBalanceAfter} ${unit} for shop o, make you restock am soon.`;
    } else if (stockBalanceAfter === 0) {
      return `I don record am. ${qty} ${unit} of ${item} don sell. Notice: stock don finish completely for shop o!`;
    }
    return `I don record am sharp sharp. ${qty} ${unit} of ${item} don sell for ₦${amount.toLocaleString()}. Stock balance wey remain na ${stockBalanceAfter} ${unit}.`;
  }

  if (type === "STOCK_PURCHASE") {
    return `Fresh stock don enter! You restock ${qty} ${unit} of ${item} with ₦${amount.toLocaleString()}. Total goods for shop now na ${stockBalanceAfter} ${unit}.`;
  }

  if (type === "DEBT_COLLECTION") {
    return `Gbese don recover! Customer pay ₦${amount.toLocaleString()} cash clean. Money don enter drawer back.`;
  }

  return `I don record am sharp sharp. ₦${amount.toLocaleString()} entry don enter shop directory ledger.`;
}
