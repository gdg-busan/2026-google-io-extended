import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, type Firestore, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { afterAll, afterEach, beforeAll, describe, it } from "vitest";

// @firebase/rules-unit-testing types `RulesTestContext.firestore()` against the
// legacy compat namespace (`firebase.firestore.Firestore`), but its own docs
// say the returned instance is meant to be used with the modular SDK (the
// runtime object is the same either way). Cast once here instead of at every
// call site.
function toModularFirestore(context: RulesTestContext): Firestore {
  return context.firestore() as unknown as Firestore;
}

// Firestore security rules emulator tests.
// Spec: .omc/plans/ralplan-io2026-builder-board.md — "Firestore 보안 규칙"
// section + Verification Steps #2. Task #2 acceptance:
//   - 타인 문서 쓰기 거부 (deny cross-user writes)
//   - 소유자의 hidden/answered/status/order/aiIntro 쓰기 거부 (system-field whitelist)
//   - likes 중복 create 거부 (duplicate like create denied)
//   - cardRecovery 클라이언트 접근 거부 (deny-all)

const PROJECT_ID = "demo-io2026-rules-test";
const OWNER_UID = "owner-uid-aaaaaaaaaaaaaaaaaaaaaa";
const OTHER_UID = "other-uid-bbbbbbbbbbbbbbbbbbbbbb";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rules = readFileSync(resolve(__dirname, "../../firestore.rules"), "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

async function seed(setup: (db: Firestore) => Promise<void>) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setup(toModularFirestore(context));
  });
}

describe("cards/{cardId}", () => {
  it("allows create when ownerUid matches auth uid and hidden is false", async () => {
    const db = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertSucceeds(
      setDoc(doc(db, "cards", "card-1"), {
        ownerUid: OWNER_UID,
        nickname: "Alice",
        company: "GDG",
        role: "Engineer",
        github: "",
        linkedin: "",
        service: "",
        hidden: false,
      }),
    );
  });

  it("denies create when ownerUid does not match auth uid", async () => {
    const db = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertFails(
      setDoc(doc(db, "cards", "card-1"), {
        ownerUid: OWNER_UID,
        nickname: "Eve",
        hidden: false,
      }),
    );
  });

  it("denies cross-user writes to another owner's card", async () => {
    await seed((db) =>
      setDoc(doc(db, "cards", "card-1"), {
        ownerUid: OWNER_UID,
        nickname: "Alice",
        company: "GDG",
        role: "Engineer",
        github: "",
        linkedin: "",
        service: "",
        hidden: false,
      }),
    );

    const attacker = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertFails(updateDoc(doc(attacker, "cards", "card-1"), { nickname: "Hacked" }));
  });

  it("allows the owner to update whitelisted profile fields", async () => {
    await seed((db) =>
      setDoc(doc(db, "cards", "card-1"), {
        ownerUid: OWNER_UID,
        nickname: "Alice",
        company: "GDG",
        role: "Engineer",
        github: "",
        linkedin: "",
        service: "",
        hidden: false,
      }),
    );

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertSucceeds(updateDoc(doc(owner, "cards", "card-1"), { nickname: "Alice B" }));
  });

  it("denies the owner writing the system field hidden", async () => {
    await seed((db) =>
      setDoc(doc(db, "cards", "card-1"), {
        ownerUid: OWNER_UID,
        nickname: "Alice",
        hidden: false,
      }),
    );

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(updateDoc(doc(owner, "cards", "card-1"), { hidden: true }));
  });

  it("denies the owner writing the system field aiIntro", async () => {
    await seed((db) =>
      setDoc(doc(db, "cards", "card-1"), {
        ownerUid: OWNER_UID,
        nickname: "Alice",
        hidden: false,
      }),
    );

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(updateDoc(doc(owner, "cards", "card-1"), { aiIntro: "self-written intro" }));
  });

  it("hides hidden cards from the public but not from the owner", async () => {
    await seed((db) =>
      setDoc(doc(db, "cards", "card-1"), {
        ownerUid: OWNER_UID,
        nickname: "Alice",
        hidden: true,
      }),
    );

    const stranger = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertFails(getDoc(doc(stranger, "cards", "card-1")));

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertSucceeds(getDoc(doc(owner, "cards", "card-1")));
  });
});

describe("cardRecovery/{cardId} — deny-all", () => {
  it("denies authenticated client reads", async () => {
    await seed((db) =>
      setDoc(doc(db, "cardRecovery", "card-1"), {
        recoveryCodeHash: "hash",
        attemptCount: 0,
      }),
    );

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(getDoc(doc(owner, "cardRecovery", "card-1")));
  });

  it("denies authenticated client writes", async () => {
    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(
      setDoc(doc(owner, "cardRecovery", "card-1"), {
        recoveryCodeHash: "hash",
        attemptCount: 0,
      }),
    );
  });

  it("denies unauthenticated access", async () => {
    const anon = toModularFirestore(testEnv.unauthenticatedContext());
    await assertFails(getDoc(doc(anon, "cardRecovery", "card-1")));
  });
});

describe("questions/{qid}", () => {
  it("denies create when uid does not match auth uid", async () => {
    const db = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertFails(
      setDoc(doc(db, "questions", "q1"), {
        text: "hi",
        uid: OWNER_UID,
        hidden: false,
        answered: false,
      }),
    );
  });

  it("denies the owner writing hidden or answered", async () => {
    await seed((db) =>
      setDoc(doc(db, "questions", "q1"), {
        text: "hi",
        uid: OWNER_UID,
        hidden: false,
        answered: false,
      }),
    );

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(updateDoc(doc(owner, "questions", "q1"), { hidden: true }));
    await assertFails(updateDoc(doc(owner, "questions", "q1"), { answered: true }));
  });

  it("denies cross-user writes to another user's question", async () => {
    await seed((db) =>
      setDoc(doc(db, "questions", "q1"), {
        text: "hi",
        uid: OWNER_UID,
        hidden: false,
        answered: false,
      }),
    );

    const attacker = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertFails(updateDoc(doc(attacker, "questions", "q1"), { text: "edited" }));
  });
});

describe("talks/{tid}", () => {
  it("denies the owner writing status or order", async () => {
    await seed((db) =>
      setDoc(doc(db, "talks", "t1"), {
        title: "My Talk",
        link: "",
        uid: OWNER_UID,
        status: "pending",
        order: 0,
      }),
    );

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(updateDoc(doc(owner, "talks", "t1"), { status: "approved" }));
    await assertFails(updateDoc(doc(owner, "talks", "t1"), { order: 1 }));
  });

  it("hides pending talks from the public but not from the applicant", async () => {
    await seed((db) =>
      setDoc(doc(db, "talks", "t1"), {
        title: "My Talk",
        uid: OWNER_UID,
        status: "pending",
        order: 0,
      }),
    );

    const stranger = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertFails(getDoc(doc(stranger, "talks", "t1")));

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertSucceeds(getDoc(doc(owner, "talks", "t1")));
  });
});

describe("likes/{qid}_{uid} — create-only dedup", () => {
  it("allows a valid first like create", async () => {
    const db = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertSucceeds(
      setDoc(doc(db, "likes", `q1_${OWNER_UID}`), { qid: "q1", uid: OWNER_UID }),
    );
  });

  it("denies a duplicate like create for the same question+uid", async () => {
    await seed((db) =>
      setDoc(doc(db, "likes", `q1_${OWNER_UID}`), { qid: "q1", uid: OWNER_UID }),
    );

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(setDoc(doc(owner, "likes", `q1_${OWNER_UID}`), { qid: "q1", uid: OWNER_UID }));
  });

  it("denies creating a like using someone else's uid suffix", async () => {
    const attacker = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertFails(
      setDoc(doc(attacker, "likes", `q1_${OWNER_UID}`), { qid: "q1", uid: OWNER_UID }),
    );
  });
});

describe("keywords/{uid}_{n} — cap at 10 slots", () => {
  it("allows create within the n=[0,9] slot range", async () => {
    const db = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertSucceeds(
      setDoc(doc(db, "keywords", `${OWNER_UID}_0`), {
        text: "Kotlin",
        type: "wordcloud",
        uid: OWNER_UID,
      }),
    );
  });

  it("denies create beyond the 10-slot cap (n=10)", async () => {
    const db = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(
      setDoc(doc(db, "keywords", `${OWNER_UID}_10`), {
        text: "Kotlin",
        type: "wordcloud",
        uid: OWNER_UID,
      }),
    );
  });

  it("denies create using another uid's slot", async () => {
    const attacker = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertFails(
      setDoc(doc(attacker, "keywords", `${OWNER_UID}_0`), {
        text: "Kotlin",
        type: "wordcloud",
        uid: OWNER_UID,
      }),
    );
  });
});

describe("scanEdges/{scannerUid}_{targetUid}", () => {
  it("allows the scanner to create a one-directional edge", async () => {
    const scanner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertSucceeds(
      setDoc(doc(scanner, "scanEdges", `${OWNER_UID}_${OTHER_UID}`), {
        scanner: OWNER_UID,
        target: OTHER_UID,
        at: 1,
      }),
    );
  });

  it("denies self-scanning", async () => {
    const scanner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(
      setDoc(doc(scanner, "scanEdges", `${OWNER_UID}_${OWNER_UID}`), {
        scanner: OWNER_UID,
        target: OWNER_UID,
        at: 1,
      }),
    );
  });

  it("lets either party read the edge, but not a third party", async () => {
    await seed((db) =>
      setDoc(doc(db, "scanEdges", `${OWNER_UID}_${OTHER_UID}`), {
        scanner: OWNER_UID,
        target: OTHER_UID,
        at: 1,
      }),
    );

    const target = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertSucceeds(getDoc(doc(target, "scanEdges", `${OWNER_UID}_${OTHER_UID}`)));

    const thirdParty = toModularFirestore(testEnv.authenticatedContext("third-uid-cccccccccccccccccccc"));
    await assertFails(getDoc(doc(thirdParty, "scanEdges", `${OWNER_UID}_${OTHER_UID}`)));
  });
});

describe("raffleEntries/{uid}", () => {
  it("allows the owner to submit their own entry", async () => {
    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertSucceeds(setDoc(doc(owner, "raffleEntries", OWNER_UID), { contact: "a@b.com", at: 1 }));
  });

  it("denies creating an entry for someone else", async () => {
    const attacker = toModularFirestore(testEnv.authenticatedContext(OTHER_UID));
    await assertFails(setDoc(doc(attacker, "raffleEntries", OWNER_UID), { contact: "a@b.com", at: 1 }));
  });
});

describe("matches/{uid} — Admin SDK only", () => {
  it("denies any client write, even by the owner", async () => {
    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertFails(setDoc(doc(owner, "matches", OWNER_UID), { results: [] }));
  });

  it("allows the owner to read their own match results", async () => {
    await seed((db) => setDoc(doc(db, "matches", OWNER_UID), { results: [] }));

    const owner = toModularFirestore(testEnv.authenticatedContext(OWNER_UID));
    await assertSucceeds(getDoc(doc(owner, "matches", OWNER_UID)));
  });
});
