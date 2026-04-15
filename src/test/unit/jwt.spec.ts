import { hashRefreshToken } from "../../lib/jwt";

describe("hashRefreshToken", () => {
  it("returns a deterministic hash for token input", () => {
    const token = "sample-refresh-token";

    const firstHash = hashRefreshToken(token);
    const secondHash = hashRefreshToken(token);

    expect(firstHash).toHaveLength(64);
    expect(firstHash).toBe(secondHash);
  });
});
