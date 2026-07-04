import type { ReactNode } from "react";
import { Container, Box } from "@radix-ui/themes";
import { AppBar } from "@/widgets/participant-shell";

export default function ParticipantLayout({ children }: { children: ReactNode }) {
  return (
    <Box>
      <AppBar />
      <Container size="1" px="4" py="5" asChild>
        <main>{children}</main>
      </Container>
    </Box>
  );
}
