import { describe, it, expect } from "vitest";
import { createStore } from "jotai";
import { uidAtom } from "@/entities/session";
import { hasRegisteredCardAtom } from "./my-card";

describe("hasRegisteredCardAtom", () => {
  it("uid가 없으면 false", () => {
    const store = createStore();
    store.set(uidAtom, null);
    expect(store.get(hasRegisteredCardAtom)).toBe(false);
  });
});
