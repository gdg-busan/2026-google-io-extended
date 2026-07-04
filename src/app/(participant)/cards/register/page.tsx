import { RegisterCardForm } from "@/features/register-card";
import { PageHeader } from "@/shared/ui-kit";

export default function RegisterCardPage() {
  return (
    <>
      <PageHeader title="명함 등록" />
      <RegisterCardForm />
    </>
  );
}
