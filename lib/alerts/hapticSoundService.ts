// ─────────────────────────────────────────────────────────────────
// MoniePay — Universal Haptic Vibration & Audio Alert Service
// Hands-Off Mobile Beep, Cash Register Chime & Background Notifications
// ─────────────────────────────────────────────────────────────────

/**
 * Synthesizes a loud, pleasant, high-fidelity cash register chime and POS confirmation beep.
 * Zero external audio downloads, zero lag, works instantly on mobile speakers.
 */
export function playCashChime(volume = 0.25) {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic 1: Crisp high tone (880Hz -> 1318.5Hz - A5 to E6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12);

    gain1.gain.setValueAtTime(volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Harmonic 2: Metallic cash chime shimmer (1760Hz - A6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1760, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(2093, now + 0.2);

    gain2.gain.setValueAtTime(volume * 0.75, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.41);
  } catch (err) {
    console.debug("Web Audio synthesis notice:", err);
  }
}

/**
 * Warning alert beep for low stock or debits
 */
export function playWarningBeep(volume = 0.2) {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(330, now + 0.1);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.29);
  } catch {}
}

/**
 * Triggers native physical hardware vibration pattern on the device.
 * Multi-pulse tactile cash confirmation: buzz-pause-buzz-long buzz
 */
export function triggerCashHapticVibration(type: "cash" | "restock" | "warning" = "cash") {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !("vibrate" in navigator)
  ) {
    return;
  }

  try {
    if (type === "cash") {
      // Distinct double-pulse cash inflow buzz
      navigator.vibrate([180, 70, 220, 80, 320]);
    } else if (type === "restock") {
      // Heavy stock restock confirmation buzz
      navigator.vibrate([150, 60, 150]);
    } else {
      // Short alert buzz
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  } catch {}
}

/**
 * Sends a background hands-off OS notification with vibration pattern
 * Works even when the app is minimized or the user's phone screen is locked!
 */
export async function sendHandsOffSystemAlert(
  title: string,
  body: string,
  payload?: { amount?: number; item?: string; url?: string }
) {
  // Always trigger foreground sound & haptic vibration immediately
  playCashChime();
  triggerCashHapticVibration("cash");

  if (typeof window === "undefined" || typeof navigator === "undefined") return;

  // Check notification permission
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {}
    }

    if (Notification.permission === "granted") {
      // 1. Try via Service Worker (supports background vibration & lock screen alerts)
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            await registration.showNotification(title, {
              body,
              icon: "/moniepay-icon-192.png",
              badge: "/moniepay-icon-192.png",
              vibrate: [200, 100, 200, 100, 350],
              tag: "moniepay-entry-alert",
              renotify: true,
              data: {
                url: payload?.url || "/directory",
                ...payload,
              },
            } as any);
            return;
          }
        } catch (swErr) {
          console.debug("Service Worker notification fallback:", swErr);
        }
      }

      // 2. Direct Notification API fallback
      try {
        new Notification(title, {
          body,
          icon: "/moniepay-icon-192.png",
          badge: "/moniepay-icon-192.png",
          tag: "moniepay-entry-alert",
        });
      } catch {}
    }
  }
}

/**
 * One-tap prompt to request notification permissions for background hands-off alerts
 */
export async function requestHandsOffAlertPermissions(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      playCashChime();
      triggerCashHapticVibration("cash");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
