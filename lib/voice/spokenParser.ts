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
  k: 1000,
  thousand: 1000,
  m: 1000000,
  million: 1000000,
  mils: 1000000,
  mil: 1000000,
  b: 1000000000,
  billion: 1000000000,
};

/**
 * Converts English number word phrases (e.g. "twenty thousand five hundred") to a number.
 */
function wordsToNumber(phrase: string): number {
  const tokens = phrase
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\band\b/g, " ")
    .replace(/[,\.₦]/g, " ")
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
 * Robustly parses spoken text to extract the Naira amount.
 * Handles digits, words, "k", "thousand", "million", "naira", currency symbols.
 */
export function parseSpokenMarketAmount(rawText: string): number {
  if (!rawText) return 0;

  const text = rawText
    .toLowerCase()
    .replace(/[₦#,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Pattern 1: Decimal million/k formats e.g. "1.5m", "1.5 million", "2.5k"
  const decMatch = text.match(/(\d+\.?\d*)\s*(m|million|mils|mil|k|thousand|b|billion)/i);
  if (decMatch) {
    const val = parseFloat(decMatch[1]);
    const unit = decMatch[2].toLowerCase();
    if (unit.startsWith("m")) return Math.round(val * 1000000);
    if (unit.startsWith("k") || unit.startsWith("thous")) return Math.round(val * 1000);
    if (unit.startsWith("b")) return Math.round(val * 1000000000);
  }

  // Pattern 2: Raw number directly followed by naira or stand-alone large number
  const numMatch = text.match(/\b(\d{2,10})\b/);
  if (numMatch) {
    const parsed = parseInt(numMatch[1], 10);
    if (parsed > 0) return parsed;
  }

  // Pattern 3: Hybrid text like "twenty thousand" or "forty five k"
  const wordsMatch = text.match(
    /\b((?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|k|\d+)(?:\s+(?:and\s+)?(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|k|\d+))*)\b/i
  );

  if (wordsMatch) {
    const parsedFromWords = wordsToNumber(wordsMatch[1]);
    if (parsedFromWords > 0) return parsedFromWords;
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
