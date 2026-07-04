"use client";

import { collection, or, query, where, type Query } from "firebase/firestore";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { uidAtom } from "@/entities/session";
import type { ScanEdgeData } from "./types";

/**
 * All Passport scan edges I'm part of — `scanner == me OR target == me`
 * (Firestore composite-OR query; indexes scanEdges(scanner,at)/(target,at)
 * exist). A single scan connects both people.
 */
const myScanEdgesAtom = atomWithObservable<(ScanEdgeData & { id: string })[]>(
  (get) => {
    const uid = get(uidAtom) ?? "__no_uid__";
    return collectionObservable(
      query(
        collection(db, "scanEdges"),
        or(where("scanner", "==", uid), where("target", "==", uid)),
      ) as Query<ScanEdgeData>,
    );
  },
  { initialValue: [] },
);

/** Distinct builders I've connected with via Passport scans. */
export const connectionCountAtom = atom((get) => {
  const uid = get(uidAtom);
  if (!uid) return 0;
  const connectedUids = new Set<string>();
  for (const edge of get(myScanEdgesAtom)) {
    const other: string = edge.scanner === uid ? edge.target : edge.scanner;
    if (other && other !== uid) {
      connectedUids.add(other);
    }
  }
  return connectedUids.size;
});
