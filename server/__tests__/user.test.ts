import { app } from "../server";
import { prisma } from "./setupDb";
import { users } from "./mockData/users";
import request from "supertest";
import { it, describe, expect } from "vitest";

describe("/api/user", () => {
  it("should create a user", async () => {
    const response = await request(app)
      .post("/api/user")
      .send(users[0])
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect("set-cookie", /^access_token=/, /^refresh_token=/)
      .expect(200);

    expect(response.body.user.username).toEqual(users[0].username);
    expect(response.body.message).toEqual("User created!");
    expect(
      await prisma.user.findUnique({
        where: { username: response.body.user.username },
      })
    ).toBeDefined();
  });

  it("should throw an error if username already exists", async () => {
    const response = await request(app)
      .post("/api/user")
      .send(users[0])
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400);
  });

  it("should allow multiple users", async () => {
    const response = await request(app)
      .post("/api/user")
      .send(users[1])
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect("set-cookie", /^access_token=/, /^refresh_token=/)
      .expect(200);

    expect(response.body.user.username).toEqual(users[1].username);
    expect(response.body.message).toEqual("User created!");
    expect(
      await prisma.user.findUnique({
        where: { username: response.body.user.username },
      })
    ).toBeDefined();
  });
});
