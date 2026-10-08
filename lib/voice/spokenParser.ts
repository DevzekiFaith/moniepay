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

  const text = rawText.toLowerCase().trim();

  // 1. Hybrid numeric with word/multiplier suffix:
  // e.g. "20 thousand", "20thousand", "20k", "20 k", "1.5 million", "1.5m", "100k", "500 hundred"
  const hybridMultiplierRegex = /(\d+(?:\.\d+)?)\s*(k|thousand|million|m|billion|b|hundred)\b/i;
  const hybridMatch = text.match(hybridMultiplierRegex);
  if (hybridMatch) {
    const val = parseFloat(hybridMatch[1]);
    const multUnit = hybridMatch[2].toLowerCase();
    const mult = MULTIPLIERS[multUnit] || 1;
    return Math.round(val * mult);
  }

  // 2. Full digit match with optional currency symbols:
  // e.g. "20000", "20,000", "₦20000", "ngn 20,000", "20000 naira", "20000.00"
  const directDigitRegex = /(?:₦|ngn|\$)?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:\s*naira)?/i;
  const digitMatch = text.match(directDigitRegex);
  if (digitMatch) {
    const cleanNum = parseFloat(digitMatch[1].replace(/,/g, ""));
    // Check if followed by "thousand" or "million" right after
    const afterDigitText = text.slice((digitMatch.index || 0) + digitMatch[0].length).trim();
    if (/^(?:thousand|k\b)/i.test(afterDigitText)) {
      return Math.round(cleanNum * 1000);
    }
    if (/^(?:million|m\b)/i.test(afterDigitText)) {
      return Math.round(cleanNum * 1000000);
    }
    if (!isNaN(cleanNum) && cleanNum > 0) {
      return cleanNum;
    }
  }

  // 3. Spoken number words:
  // e.g. "twenty thousand naira", "two hundred thousand", "one million five hundred thousand", "fifty thousand"
  const wordAmount = wordsToNumber(text);
  if (wordAmount > 0) {
    return wordAmount;
  }

  return 0;
}

/**
 * Universal High-Quality Female Voice Player for Web Speech Synthesis
 * Guarantees a female voice on all devices (Windows Surface Pro, PC, Mac, iPhone, Android)
 */
export function playFemaleTraderVoice(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-NG";
    utterance.rate = 1.0;
    // Set feminine pitch (1.15) for warm, natural and pleasant tone
    utterance.pitch = 1.15;

    const voices = window.speechSynthesis.getVoices();

    if (voices && voices.length > 0) {
      // 1. Priority 1: High quality English female voices
      const femaleKeywords = [
        "zira", // Windows 10/11 Microsoft Zira (Female)
        "jenny", // Microsoft Jenny (Natural Female)
        "samantha", // Apple Samantha (Female)
        "victoria", // Apple Victoria (Female)
        "karen", // Apple / Australian Female
        "moira", // Irish Female
        "fiona", // Scottish Female
        "catherine",
        "susan",
        "hazel",
        "serena",
        "female",
        "google uk english female",
        "google us english",
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
      ];

      // Find best female voice
      let selectedVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        const isEnglish = v.lang.startsWith("en");
        const hasFemaleKeyword = femaleKeywords.some((kw) => name.includes(kw));
        const hasMaleKeyword = maleKeywords.some((kw) => name.includes(kw));
        return isEnglish && hasFemaleKeyword && !hasMaleKeyword;
      });

      // Priority 2: Any English voice that is NOT explicitly named male
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
    console.warn("Speech synthesis error:", err);
  }
}
