import { createFileRoute } from "@tanstack/react-router";
import { CodeBreakerGame } from "@/components/bonus-games";
export const Route = createFileRoute("/codebreaker")({ head: () => ({ meta: [{ title: "密码破译 — 复古电脑" }, { name: "description", content: "复古电脑卡带游戏：根据提示破解四位密码。" }, { property: "og:title", content: "密码破译 — 复古电脑" }, { property: "og:description", content: "复古电脑卡带游戏：根据提示破解四位密码。" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: CodeBreakerGame });
