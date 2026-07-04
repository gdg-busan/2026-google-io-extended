import { RecoverCardForm } from "@/features/recover-card";
import { PageHeader } from "@/shared/ui-kit";

export default function RecoverCardPage() {
  return (
    <>
      <PageHeader title="명함 복구" />
      <RecoverCardForm />
    </>
  );
}
