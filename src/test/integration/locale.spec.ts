import request from "supertest";
import { app } from "../../app";

describe("Localization", () => {
  it("returns translated error when Accept-Language is id", async () => {
    const response = await request(app)
      .get("/auth/me")
      .set("Accept-Language", "id");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token akses tidak ada");
  });

  it("returns English error by default", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Missing access token");
  });
});
