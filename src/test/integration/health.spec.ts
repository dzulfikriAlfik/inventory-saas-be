import request from "supertest";
import { ApiPath } from "../../constants/api-path";
import { HealthStatus } from "../../constants/health";
import { HttpStatus } from "../../constants/http-status";
import { app } from "../../app";

describe(`GET ${ApiPath.Health}`, () => {
  it("returns service health status", async () => {
    const response = await request(app).get(ApiPath.Health);

    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toEqual({ status: HealthStatus.Ok });
  });
});
