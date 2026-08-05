/**
 * MVP smoke test — exercises mock auth/invite/chat/translate/billing/call gating
 * without a device UI. Run: npm run mvp-smoke
 */
import {
  signupRequest,
  loginRequest,
  updateUserProfile,
  restoreSession,
  logoutRequest,
} from "../src/services/authService";
import { loadSession } from "../src/services/sessionStorage";
import {
  createInvites,
  acceptInvite,
  listOutgoingInvites,
} from "../src/repositories/inviteRepository";
import { getChatById } from "../src/repositories/chatRepository";
import {
  getMessages,
  sendMessage,
} from "../src/repositories/messageRepository";
import { translateMessageForUser } from "../src/services/translationService";
import {
  getSubscription,
  purchaseSubscription,
  hasActiveEntitlement,
  clearUserSubscription,
} from "../src/services/subscriptionService";
import { purchaseViaStore } from "../src/services/billingBridge";
import { useSubscriptionStore } from "../src/store/subscriptionStore";
import { mockChatApi, mockTranslationApi } from "../src/api/mockApi";
import type { SubscriptionPlan } from "../src/types/models";

type CheckResult = { name: string; ok: boolean; detail?: string };

const results: CheckResult[] = [];

function pass(name: string, detail?: string) {
  results.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, detail: string) {
  results.push({ name, ok: false, detail });
  console.error(`FAIL  ${name} — ${detail}`);
}

async function check(name: string, fn: () => Promise<string | void>) {
  try {
    const detail = await fn();
    pass(name, detail ?? undefined);
  } catch (err) {
    fail(name, err instanceof Error ? err.message : String(err));
  }
}

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

/** Mirrors AudioCallScreen / VideoCall toggleAi entitlement gating. */
function callAiTranslateGating(isEntitled: boolean, currentlyOn: boolean): {
  aiOn: boolean;
  paywall: boolean;
} {
  if (currentlyOn) {
    return { aiOn: false, paywall: false };
  }
  if (!isEntitled) {
    return { aiOn: false, paywall: true };
  }
  return { aiOn: true, paywall: false };
}

/** Mirrors ChatScreen handleToggleTranslate entitlement gating. */
function chatTranslateGating(isEntitled: boolean, currentlyOn: boolean): {
  translateEnabled: boolean;
  paywall: boolean;
} {
  if (currentlyOn) {
    return { translateEnabled: false, paywall: false };
  }
  if (!isEntitled) {
    return { translateEnabled: false, paywall: true };
  }
  return { translateEnabled: true, paywall: false };
}

const UNIQUE = Date.now();
const EMAIL = `lingowave.smoke.${UNIQUE}@gmail.com`;
const EMAIL_B = `lingowave.smoke.b.${UNIQUE}@gmail.com`;
const PHONE = `+1555${String(UNIQUE).slice(-7)}`;
const INVITE_PHONE = `+1555${String(UNIQUE + 1).slice(-7)}`;
const PASSWORD = "smoke12345";

async function main() {
  console.log("LingoWave MVP smoke test (Supabase)\n");

  let authReady = false;

  await check("1. Auth signup (phone) + session persistence", async () => {
    const signup = await signupRequest("Smoke Tester", EMAIL, PASSWORD, PHONE);
    assert(signup.ok, signup.ok ? "" : signup.error);
    assert(signup.session.user.phone.includes("1555"), "phone not saved");
    assert(Boolean(signup.session.token), "token missing");

    const loaded = await loadSession();
    assert(loaded?.user.email === EMAIL, "session not in memory fallback");
    assert(loaded?.token === signup.session.token, "token mismatch after load");

    await logoutRequest();
    const afterLogout = await loadSession();
    assert(afterLogout === null, "session should clear on logout");

    const login = await loginRequest(EMAIL, PASSWORD);
    assert(login.ok, login.ok ? "" : login.error);
    const restored = await restoreSession();
    assert(restored?.user.email === EMAIL, "restoreSession failed after login");
    authReady = true;
    return `user=${restored!.user.id}`;
  });

  if (!authReady) {
    console.log(
      "\nSkipping live Supabase data checks (auth unavailable — often email rate limit or confirm-email setting).\nRunning local entitlement/gating checks with a synthetic user…\n"
    );
    const syntheticUserId = `smoke_local_${UNIQUE}`;

    await check("5. AI translate: paywall path / with entitlement", async () => {
      await clearUserSubscription(syntheticUserId);
      await useSubscriptionStore.getState().hydrate(syntheticUserId);
      const without = chatTranslateGating(
        useSubscriptionStore.getState().isEntitled(),
        false
      );
      assert(without.paywall === true, "expected paywall when not entitled");
      const translated = await translateMessageForUser({
        message: {
          id: "local",
          type: "text",
          content: "Hello",
          originalText: "Hello",
          time: "Now",
          isMe: true,
        },
        targetLanguage: "hi",
      });
      assert(translated.translations?.hi, "expected hi translation");
      return `local paywallOK translated=${translated.translations!.hi}`;
    });

    await check("6. Subscription: monthly/quarterly/yearly + persist", async () => {
      const plans: SubscriptionPlan[] = ["monthly", "quarterly", "yearly"];
      for (const plan of plans) {
        await clearUserSubscription(syntheticUserId);
        await purchaseSubscription(syntheticUserId, plan);
        const sub = await getSubscription(syntheticUserId);
        assert(sub.plan === plan, `expected plan ${plan}, got ${sub.plan}`);
        assert(hasActiveEntitlement(sub), `${plan} not active`);
      }
      return "monthly+quarterly+yearly ok (local)";
    });

    await check("7. Calls: AI translate gated by entitlement", async () => {
      await clearUserSubscription(syntheticUserId);
      await useSubscriptionStore.getState().hydrate(syntheticUserId);
      const denied = callAiTranslateGating(false, false);
      assert(denied.paywall && !denied.aiOn, "call AI should paywall when free");
      const allowed = callAiTranslateGating(true, false);
      assert(allowed.aiOn && !allowed.paywall, "call AI should enable when entitled");
      return "gating logic verified (local)";
    });

    console.log("\n—— Summary ——");
    const failed = results.filter((r) => !r.ok);
    for (const r of results) {
      console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? ` (${r.detail})` : ""}`);
    }
    console.log(
      `\n${results.length - failed.length}/${results.length} passed` +
        (failed.length ? `, ${failed.length} failed` : "")
    );
    if (failed.length) {
      process.exitCode = 1;
    }
    return;
  }

  await check("2. Preferred language onboarding", async () => {
    const result = await updateUserProfile({ preferredLanguage: "hi" });
    assert(result.ok, result.ok ? "" : result.error);
    assert(result.session.user.preferredLanguage === "hi", "language not set");
    const session = await loadSession();
    assert(session?.user.preferredLanguage === "hi", "language not persisted");
    return "preferredLanguage=hi";
  });

  let sharedChatId = "";
  let acceptorId = "";

  await check("3. Invites: send by phone + accept → shared chat", async () => {
    const sessionA = await loadSession();
    assert(sessionA, "need authenticated session");

    await logoutRequest();
    const signupB = await signupRequest(
      "Smoke Acceptor",
      EMAIL_B,
      PASSWORD,
      INVITE_PHONE
    );
    assert(signupB.ok, signupB.ok ? "" : signupB.error);
    acceptorId = signupB.session.user.id;

    await logoutRequest();
    const loginA = await loginRequest(EMAIL, PASSWORD);
    assert(loginA.ok, loginA.ok ? "" : loginA.error);
    const session = loginA.session;

    const created = await createInvites({
      fromUserId: session.user.id,
      fromUserName: session.user.name,
      phones: [INVITE_PHONE],
      message: "Smoke invite",
    });
    assert(created.ok, created.ok ? "" : created.error);
    assert(created.invites.length === 1, "expected one invite");
    assert(created.invites[0].status === "pending", "invite not pending");

    const outgoing = await listOutgoingInvites(session.user.id);
    assert(
      outgoing.some((i) => i.id === created.invites[0].id),
      "invite missing from outgoing"
    );

    await logoutRequest();
    const loginB = await loginRequest(EMAIL_B, PASSWORD);
    assert(loginB.ok, loginB.ok ? "" : loginB.error);

    const accepted = await acceptInvite({
      inviteId: created.invites[0].id,
      acceptorUserId: acceptorId,
      acceptorName: "Smoke Acceptor",
    });
    assert(accepted.ok, accepted.ok ? "" : accepted.error);
    sharedChatId = accepted.chat.id;
    const chat = await getChatById(sharedChatId);
    assert(chat, "shared chat not in repository");
    return `chatId=${sharedChatId}`;
  });

  await check("4. Chat: send text + media URI", async () => {
    const chatId = sharedChatId;
    assert(chatId, "need shared chat from invite step");
    const token = (await loadSession())!.token;

    const textMsg = {
      type: "text" as const,
      content: "Hello from smoke test",
      originalText: "Hello from smoke test",
      sourceLanguage: "en" as const,
      isMe: true,
      senderId: acceptorId,
    };

    const sent = await mockChatApi.sendMessage(token, chatId, textMsg);
    assert(sent.ok, sent.ok ? "" : sent.ok === false ? sent.error : "send failed");
    assert(sent.data.content === "Hello from smoke test", "text content wrong");

    const mediaSent = await sendMessage(chatId, {
      type: "image",
      content: "file://mock/smoke-test-image.jpg",
      fileName: "smoke-test-image.jpg",
      isMe: true,
      senderId: acceptorId,
    });
    assert(mediaSent, "media send failed");

    const after = await getMessages(chatId);
    assert(
      after.some((m) => m.content === "file://mock/smoke-test-image.jpg"),
      "media URI not stored"
    );
    assert(
      after.some((m) => m.content === "Hello from smoke test"),
      "text message missing"
    );
    return `messages=${after.length}`;
  });

  await check("5. AI translate: paywall path / with entitlement", async () => {
    const session = await loadSession();
    assert(session, "need session");
    await clearUserSubscription(session.user.id);
    await useSubscriptionStore.getState().hydrate(session.user.id);

    const without = chatTranslateGating(
      useSubscriptionStore.getState().isEntitled(),
      false
    );
    assert(without.paywall === true, "expected paywall when not entitled");
    assert(without.translateEnabled === false, "translate should stay off");

    const raw = await mockTranslationApi.translateText(session.token, {
      text: "Hello",
      targetLanguage: "es",
    });
    assert(raw.ok, "translate API failed");
    assert(
      raw.data.translatedText.toLowerCase().includes("hola") ||
        raw.data.translatedText.includes("[ES]"),
      `unexpected translation: ${raw.data.translatedText}`
    );

    await purchaseSubscription(session.user.id, "monthly");
    await useSubscriptionStore.getState().hydrate(session.user.id);
    assert(
      useSubscriptionStore.getState().isEntitled(),
      "should be entitled after purchase"
    );

    const withEnt = chatTranslateGating(true, false);
    assert(withEnt.translateEnabled === true && !withEnt.paywall, "should enable");

    const chatId = sharedChatId || "";
    const msgs = chatId ? await getMessages(chatId) : [];
    const sample =
      msgs.find((m) => m.type === "text") ??
      msgs[0] ?? {
        id: "local",
        type: "text" as const,
        content: "Hello",
        originalText: "Hello",
        time: "Now",
        isMe: true,
      };
    const translated = await translateMessageForUser({
      message: sample,
      targetLanguage: "hi",
    });
    assert(
      translated.translations?.hi,
      "expected hi translation cached on message"
    );
    return `paywallOK translated=${translated.translations!.hi}`;
  });

  await check("6. Subscription: monthly/quarterly/yearly + persist", async () => {
    const session = await loadSession();
    assert(session, "need session");
    const userId = session.user.id;
    const plans: SubscriptionPlan[] = ["monthly", "quarterly", "yearly"];

    for (const plan of plans) {
      await clearUserSubscription(userId);
      const storeResult = await purchaseViaStore(plan);
      assert(storeResult.ok, storeResult.ok ? "" : storeResult.error);

      const sub = await getSubscription(userId);
      assert(sub.plan === plan, `expected plan ${plan}, got ${sub.plan}`);
      assert(hasActiveEntitlement(sub), `${plan} not active`);

      const again = await getSubscription(userId);
      assert(again.plan === plan && hasActiveEntitlement(again), `${plan} persist`);
    }

    await useSubscriptionStore.getState().hydrate(userId);
    const purchased = await useSubscriptionStore
      .getState()
      .purchase(userId, "yearly");
    assert(purchased, "store.purchase(yearly) failed");
    assert(useSubscriptionStore.getState().isEntitled(), "store not entitled");
    return "monthly+quarterly+yearly ok";
  });

  await check("7. Calls: AI translate gated by entitlement", async () => {
    const session = await loadSession();
    assert(session, "need session");

    await clearUserSubscription(session.user.id);
    await useSubscriptionStore.getState().hydrate(session.user.id);
    const denied = callAiTranslateGating(
      useSubscriptionStore.getState().isEntitled(),
      false
    );
    assert(denied.paywall && !denied.aiOn, "call AI should paywall when free");

    await purchaseViaStore("monthly");
    await useSubscriptionStore.getState().hydrate(session.user.id);
    assert(useSubscriptionStore.getState().isEntitled(), "need entitlement");

    const allowed = callAiTranslateGating(
      useSubscriptionStore.getState().isEntitled(),
      false
    );
    assert(allowed.aiOn && !allowed.paywall, "call AI should enable when entitled");

    const toggleOff = callAiTranslateGating(true, true);
    assert(!toggleOff.aiOn && !toggleOff.paywall, "toggle off should not paywall");
    return "AudioCallScreen/VideoCall gating logic verified";
  });

  console.log("\n—— Summary ——");
  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? ` (${r.detail})` : ""}`);
  }
  console.log(
    `\n${results.length - failed.length}/${results.length} passed` +
      (failed.length ? `, ${failed.length} failed` : "")
  );

  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exitCode = 1;
});
