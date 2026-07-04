"use client";

import { useAtomValue } from "jotai";
import { archiveItemsAtom, type ArchiveType } from "@/entities/archive";

const SECTIONS: { type: ArchiveType; title: string }[] = [
  { type: "slide", title: "발표 자료" },
  { type: "photo", title: "행사 사진" },
  { type: "discord", title: "커뮤니티" },
];

/**
 * Post-event archive (task #8): slides, photos, and Discord invite —
 * everything stays reachable on the same site after the event ends.
 */
export function ArchiveView() {
  const items = useAtomValue(archiveItemsAtom);

  return (
    <main>
      <h1>행사 아카이브</h1>
      {items.length === 0 && <p>행사 후 자료가 이곳에 올라와요.</p>}
      {SECTIONS.map((section) => {
        const sectionItems = items.filter((item) => item.type === section.type);
        if (sectionItems.length === 0) return null;
        return (
          <section key={section.type}>
            <h2>{section.title}</h2>
            <ul>
              {sectionItems.map((item) => (
                <li key={item.id}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
