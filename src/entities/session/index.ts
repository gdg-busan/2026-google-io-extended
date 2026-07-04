export { SessionBootstrap } from "./ui/SessionBootstrap";
export { useSession } from "./model/use-session";
export type { UseSessionResult } from "./model/use-session";
export type { Session } from "./model/types";
// Raw atoms — exposed so other slices can build derived atoms keyed on the
// current uid (e.g. "my own X" queries). Prefer useSession() in components;
// use these only when composing new atoms.
export { uidAtom, isAuthReadyAtom } from "./model/atoms";
