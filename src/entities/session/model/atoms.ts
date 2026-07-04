import { atom } from "jotai";

/** Current anonymous-auth uid. Null until the client silent sign-in resolves. */
export const uidAtom = atom<string | null>(null);

/** True once the anonymous auth bootstrap has settled (success or failure). */
export const isAuthReadyAtom = atom<boolean>(false);
