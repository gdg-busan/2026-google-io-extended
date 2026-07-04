import { adminDb } from "@/shared/firebase/admin";
import {
  CARD_RATE_TARGET,
  EXPECTED_ATTENDEES,
  SESSION_RATE_TARGET,
} from "@/shared/config/admin";
import { AdminDashboardView } from "@/views/admin";

export default async function AdminDashboardPage() {
  const [sessionsSnapshot, cardsSnapshot, questionsSnapshot] =
    await Promise.all([
      adminDb.collection("sessions").get(),
      adminDb.collection("cards").get(),
      adminDb.collection("questions").get(),
    ]);

  return (
    <AdminDashboardView
      metrics={{
        sessionsCount: sessionsSnapshot.size,
        cardsCount: cardsSnapshot.size,
        questionsCount: questionsSnapshot.size,
        expectedAttendees: EXPECTED_ATTENDEES,
        sessionRateTarget: SESSION_RATE_TARGET,
        cardRateTarget: CARD_RATE_TARGET,
      }}
    />
  );
}
