import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  buildShareUrl,
  buildWhatsAppShareUrl,
  buildTelegramShareUrl,
  buildWebShareData,
} from "../src/lib/share.ts";

describe("Prompt 65: WhatsApp, Telegram, Web Share & Clipboard Sharing", () => {
  const sampleUrl = "https://indiapaperwork.in/driving-licence-learner/gujarat";
  const taskTitle = "Learner's Licence (LLR)";
  const stateName = "Gujarat";

  it("appends UTM parameters for whatsapp sharing", () => {
    const url = buildShareUrl({ pageUrl: sampleUrl, source: "whatsapp" });
    assert.ok(url.includes("utm_source=whatsapp"), "Must include utm_source=whatsapp");
    assert.ok(url.includes("utm_medium=share"), "Must include utm_medium=share");
    assert.ok(
      url.includes("utm_campaign=checklist_share"),
      "Must include utm_campaign=checklist_share"
    );
  });

  it("appends UTM parameters for telegram sharing", () => {
    const url = buildShareUrl({ pageUrl: sampleUrl, source: "telegram" });
    assert.ok(url.includes("utm_source=telegram"), "Must include utm_source=telegram");
    assert.ok(url.includes("utm_medium=share"), "Must include utm_medium=share");
  });

  it("appends UTM parameters for copy link", () => {
    const url = buildShareUrl({ pageUrl: sampleUrl, source: "copylink" });
    assert.ok(url.includes("utm_source=copylink"), "Must include utm_source=copylink");
    assert.ok(url.includes("utm_medium=share"), "Must include utm_medium=share");
  });

  it("builds valid WhatsApp wa.me link with encoded pre-filled message", () => {
    const waUrl = buildWhatsAppShareUrl(taskTitle, stateName, sampleUrl);
    assert.ok(waUrl.startsWith("https://wa.me/?text="), "Must begin with https://wa.me/?text=");

    const decoded = decodeURIComponent(waUrl.replace("https://wa.me/?text=", ""));
    assert.ok(decoded.includes(taskTitle), "Decoded text must contain task title");
    assert.ok(decoded.includes(stateName), "Decoded text must contain state name");
    assert.ok(
      decoded.includes("utm_source=whatsapp"),
      "Decoded text must contain whatsapp tracking url"
    );
  });

  it("builds valid Telegram share URL with encoded parameters", () => {
    const tgUrl = buildTelegramShareUrl(taskTitle, stateName, sampleUrl);
    assert.ok(
      tgUrl.startsWith("https://t.me/share/url?"),
      "Must begin with https://t.me/share/url?"
    );
    assert.ok(
      decodeURIComponent(tgUrl).includes("utm_source=telegram"),
      "Must track telegram referral"
    );
    assert.ok(tgUrl.includes("url="), "Must contain url query param");
    assert.ok(tgUrl.includes("text="), "Must contain text query param");
  });

  it("builds Web Share API payload with webshare UTM tracking", () => {
    const data = buildWebShareData(taskTitle, stateName, sampleUrl);
    assert.ok(data.title.includes(taskTitle), "Share title must include task title");
    assert.ok(data.text.includes(stateName), "Share text must include state name");
    assert.ok(data.url.includes("utm_source=webshare"), "Share URL must track webshare source");
  });

  it("verifies ShareButtonGroup component source provides WhatsApp, Telegram, Copy link, and Web Share", () => {
    const componentPath = path.join(process.cwd(), "src/components/task/ShareButtonGroup.tsx");
    const content = fs.readFileSync(componentPath, "utf-8");

    assert.ok(content.includes("whatsAppUrl"), "Must define WhatsApp share URL");
    assert.ok(content.includes("telegramUrl"), "Must define Telegram share URL");
    assert.ok(content.includes("navigator.clipboard.writeText"), "Must support clipboard copy");
    assert.ok(content.includes("navigator.share"), "Must support Web Share API where available");
    assert.ok(content.includes("Copied!"), "Must show copy feedback state");
  });

  it("verifies TaskSidebar and TaskPageView render ShareButtonGroup", () => {
    const sidebarPath = path.join(process.cwd(), "src/components/task/TaskSidebar.tsx");
    const pageViewPath = path.join(process.cwd(), "src/components/task/TaskPageView.tsx");

    assert.ok(
      fs.readFileSync(sidebarPath, "utf-8").includes("<ShareButtonGroup"),
      "TaskSidebar must render ShareButtonGroup"
    );
    assert.ok(
      fs.readFileSync(pageViewPath, "utf-8").includes("<ShareButtonGroup"),
      "TaskPageView must render ShareButtonGroup"
    );
  });
});
