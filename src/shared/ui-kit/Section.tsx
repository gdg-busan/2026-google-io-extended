import type { ReactNode } from "react";
import { Box, Grid, Heading } from "@radix-ui/themes";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <Box mb="6" asChild>
      <section>
        <Heading as="h2" size="3" mb="3" color="gray" highContrast>
          {title}
        </Heading>
        <Grid columns={{ initial: "1", xs: "2" }} gap="3">
          {children}
        </Grid>
      </section>
    </Box>
  );
}
