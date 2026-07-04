"use client";

import { useAtomValue } from "jotai";
import { networkingKeywordsAtom, wordcloudKeywordsAtom } from "@/entities/keyword";
import { NetworkingKeywordPicker, WordCloudSubmitForm } from "@/features/submit-keyword";

export function KeywordsView() {
  const wordcloudKeywords = useAtomValue(wordcloudKeywordsAtom);
  const networkingKeywords = useAtomValue(networkingKeywordsAtom);

  return (
    <main>
      <section>
        <h1>Word Cloud 키워드</h1>
        <WordCloudSubmitForm />
        <p>{wordcloudKeywords.length}개 제출됨</p>
      </section>
      <section>
        <h2>네트워킹 키워드</h2>
        <NetworkingKeywordPicker />
        <ul>
          {networkingKeywords.map((keyword) => (
            <li key={keyword.id}>{keyword.text}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
