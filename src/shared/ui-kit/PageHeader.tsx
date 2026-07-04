import type { ReactNode } from "react";
import { Flex, Heading, Text } from "@radix-ui/themes";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Flex justify="between" align="start" mb="4" gap="3">
      <Flex direction="column" gap="1">
        <Heading as="h1" size="6">
          {title}
        </Heading>
        {subtitle ? (
          <Text size="2" color="gray">
            {subtitle}
          </Text>
        ) : null}
      </Flex>
      {action ? <Flex flexShrink="0">{action}</Flex> : null}
    </Flex>
  );
}
