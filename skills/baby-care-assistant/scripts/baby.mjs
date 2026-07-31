#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const VALID_TYPES = new Set(["feed", "sleep", "diaper", "mood", "temperature"]);

function usage() {
  return `宝宝助手命令：
  chat <自然语言>             记录、查询、汇总、更正或撤销
  records [--type 类型] [--limit 数量]
  profile
  session [--clear]
  health

凭据：设置 BABY_FAMILY_CODE，或运行 configure-macos.sh 存入钥匙串。`;
}

function keychainValue(service) {
  if (process.platform !== "darwin") return "";
  try {
    return execFileSync("/usr/bin/security", [
      "find-generic-password",
      "-a", process.env.USER || "baby-care",
      "-s", service,
      "-w",
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function configuration(requireCode = true) {
  const apiBase = (process.env.BABY_API_BASE || keychainValue("baby-care-assistant-api-base")).replace(/\/$/, "");
  const familyCode = (process.env.BABY_FAMILY_CODE || keychainValue("baby-care-assistant-family-code")).trim();
  const caregiverName = (process.env.BABY_CAREGIVER_NAME || keychainValue("baby-care-assistant-caregiver-name") || "家人").trim();
  if (!apiBase) {
    throw new Error("未配置宝宝助手 API 地址。请运行 scripts/configure-macos.sh，或设置 BABY_API_BASE。");
  }
  if (requireCode && !familyCode) {
    throw new Error("未配置家庭访问码。请运行 scripts/configure-macos.sh，或设置 BABY_FAMILY_CODE。");
  }
  return { apiBase, familyCode, caregiverName };
}

async function request(path, options = {}) {
  const needsCode = path !== "/health";
  const { apiBase, familyCode, caregiverName } = configuration(needsCode);
  const headers = new Headers(options.headers || {});
  if (needsCode) {
    headers.set("x-baby-family-code", familyCode);
    headers.set("x-baby-caregiver-name", encodeURIComponent(caregiverName));
  }
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
    signal: AbortSignal.timeout(20000),
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const error = new Error(body.error || `宝宝助手接口返回 ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return body;
}

function option(args, name, fallback = "") {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  if (["help", "--help", "-h"].includes(command)) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  let result;
  if (command === "chat") {
    const message = args.slice(1).join(" ").trim();
    if (!message) throw new Error("chat 命令需要自然语言内容。");
    result = await request("/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } else if (command === "records") {
    const type = option(args, "--type");
    const limit = Math.max(1, Math.min(100, Number(option(args, "--limit", "20")) || 20));
    if (type && !VALID_TYPES.has(type)) throw new Error(`不支持的记录类型：${type}`);
    const payload = await request("/events");
    const events = Array.isArray(payload.events) ? payload.events : [];
    result = { events: events.filter((event) => !type || event.type === type).slice(0, limit), count: events.length };
  } else if (command === "profile") {
    result = await request("/profile");
  } else if (command === "session") {
    result = await request("/agent/session", { method: args.includes("--clear") ? "DELETE" : "GET" });
  } else if (command === "health") {
    result = await request("/health");
  } else {
    throw new Error(`未知命令：${command}\n${usage()}`);
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
  const output = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    ...(error?.status ? { status: error.status } : {}),
  };
  process.stderr.write(`${JSON.stringify(output, null, 2)}\n`);
  process.exitCode = 1;
});
