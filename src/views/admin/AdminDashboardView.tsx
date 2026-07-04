export interface AdminMetrics {
  sessionsCount: number;
  cardsCount: number;
  questionsCount: number;
  expectedAttendees: number;
  sessionRateTarget: number;
  cardRateTarget: number;
}

type Props = { metrics: AdminMetrics };

/**
 * /admin dashboard (task #6): sessions/cards/questions counts vs the
 * 50명·80%/60% targets, plus the UID-inflation error-bar caveat (plan:
 * "지표 대시보드 ... UID 인플레이션 오차 표기").
 */
export function AdminDashboardView({ metrics }: Props) {
  const sessionRate = metrics.sessionsCount / metrics.expectedAttendees;
  const cardRate = metrics.cardsCount / metrics.expectedAttendees;

  return (
    <main>
      <h1>지표 대시보드</h1>
      <section>
        <article>
          <h2>접속 (sessions)</h2>
          <p>
            {metrics.sessionsCount} / {metrics.expectedAttendees} (
            {Math.round(sessionRate * 100)}%, 목표{" "}
            {Math.round(metrics.sessionRateTarget * 100)}%)
          </p>
        </article>
        <article>
          <h2>명함 등록 (cards)</h2>
          <p>
            {metrics.cardsCount} / {metrics.expectedAttendees} (
            {Math.round(cardRate * 100)}%, 목표{" "}
            {Math.round(metrics.cardRateTarget * 100)}%)
          </p>
        </article>
        <article>
          <h2>질문 (questions)</h2>
          <p>{metrics.questionsCount}</p>
        </article>
      </section>
      <p role="note">
        ⚠ 오차 범위: 익명 Auth UID는 사람이 아니라 브라우저 프로필 단위입니다.
        시크릿 창 사용이나 브라우저 데이터 삭제 후 재접속하면 새 UID가
        발급되어 세션 수가 실제 참석자 수보다 부풀려질 수 있습니다(UID
        인플레이션). 위 수치는 실측 근사치이며 엄밀한 상한이 아닙니다.
      </p>
    </main>
  );
}
