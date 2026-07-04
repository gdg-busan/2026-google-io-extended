import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Callout, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";

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
    <Flex direction="column">
      <PageHeader title="지표 대시보드" />
      <Grid columns={{ initial: "1", sm: "3" }} gap="3" mb="4">
        <Card size="2">
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              접속 (sessions)
            </Text>
            <Heading as="h2" size="5">
              {metrics.sessionsCount} / {metrics.expectedAttendees}
            </Heading>
            <Text size="2" color="gray">
              {Math.round(sessionRate * 100)}%, 목표{" "}
              {Math.round(metrics.sessionRateTarget * 100)}%
            </Text>
          </Flex>
        </Card>
        <Card size="2">
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              명함 등록 (cards)
            </Text>
            <Heading as="h2" size="5">
              {metrics.cardsCount} / {metrics.expectedAttendees}
            </Heading>
            <Text size="2" color="gray">
              {Math.round(cardRate * 100)}%, 목표{" "}
              {Math.round(metrics.cardRateTarget * 100)}%
            </Text>
          </Flex>
        </Card>
        <Card size="2">
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              질문 (questions)
            </Text>
            <Heading as="h2" size="5">
              {metrics.questionsCount}
            </Heading>
          </Flex>
        </Card>
      </Grid>
      <Callout.Root color="amber" role="note">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          오차 범위: 익명 Auth UID는 사람이 아니라 브라우저 프로필 단위입니다.
          시크릿 창 사용이나 브라우저 데이터 삭제 후 재접속하면 새 UID가
          발급되어 세션 수가 실제 참석자 수보다 부풀려질 수 있습니다(UID
          인플레이션). 위 수치는 실측 근사치이며 엄밀한 상한이 아닙니다.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
