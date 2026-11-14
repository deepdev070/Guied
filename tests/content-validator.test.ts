import { describe, it } from "node:test";
import assert from "node:assert";
import { isOfficialGovernmentDomain } from "../scripts/validate-content.ts";

describe("Content Validator - Official Government Domains", () => {
  it("recognizes standard .gov.in domains", () => {
    assert.strictEqual(isOfficialGovernmentDomain("https://parivahan.gov.in/sarathi"), true);
    assert.strictEqual(isOfficialGovernmentDomain("https://uidai.gov.in/myaadhaar"), true);
    assert.strictEqual(isOfficialGovernmentDomain("https://digitalgujarat.gov.in"), true);
    assert.strictEqual(isOfficialGovernmentDomain("https://incometax.gov.in"), true);
  });

  it("recognizes standard .nic.in domains", () => {
    assert.strictEqual(isOfficialGovernmentDomain("https://morth.nic.in/notifications"), true);
    assert.strictEqual(isOfficialGovernmentDomain("https://delhi.nic.in"), true);
  });

  it("rejects non-governmental or commercial domains", () => {
    assert.strictEqual(isOfficialGovernmentDomain("https://fakeportal.com"), false);
    assert.strictEqual(isOfficialGovernmentDomain("https://agent-services.in"), false);
    assert.strictEqual(isOfficialGovernmentDomain("https://blog.org"), false);
    assert.strictEqual(isOfficialGovernmentDomain("invalid-url-string"), false);
  });
});
