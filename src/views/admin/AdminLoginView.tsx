"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Callout, Card, Container, Flex, Heading, Text, TextField } from "@radix-ui/themes";

/** /admin/login screen (task #6): passcode form -> POST /api/admin/login. */
export function AdminLoginView() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "로그인에 실패했어요.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="1" px="4" py="8" asChild>
      <main>
        <Flex direction="column" align="center" justify="center" style={{ minHeight: "70vh" }}>
          <Card size="3" style={{ width: "100%", maxWidth: 360 }}>
            <Flex direction="column" gap="4" asChild>
              <form onSubmit={handleSubmit}>
                <Heading as="h1" size="5" align="center">
                  운영 콘솔 로그인
                </Heading>
                <Flex direction="column" gap="2">
                  <Text as="label" htmlFor="admin-passcode" size="2" weight="medium">
                    Passcode
                  </Text>
                  <TextField.Root
                    id="admin-passcode"
                    type="password"
                    value={passcode}
                    onChange={(event) => setPasscode(event.target.value)}
                    disabled={isSubmitting}
                    required
                    size="3"
                  />
                </Flex>
                {error && (
                  <Callout.Root color="red" size="1" role="alert">
                    <Callout.Text>{error}</Callout.Text>
                  </Callout.Root>
                )}
                <Button type="submit" disabled={isSubmitting || !passcode} size="3">
                  {isSubmitting ? "확인 중..." : "로그인"}
                </Button>
              </form>
            </Flex>
          </Card>
        </Flex>
      </main>
    </Container>
  );
}
