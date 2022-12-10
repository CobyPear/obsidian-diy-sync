import { app } from "../server";
import { prisma } from "./setupDb";
import { users } from "./mockData/users";
import request from "supertest";
import { it, describe, expect } from "vitest";

describe("user", () => {
  it("should create a user", async () => {
    const response = await request(app)
      .post("/api/user")
      .send(users[0])
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.user.username).toEqual(users[0].username);
    expect(response.body.message).toEqual("User created!");
    expect(
      await prisma.user.findUnique({
        where: { username: response.body.user.username },
      })
    ).toBeDefined();
  });
});

