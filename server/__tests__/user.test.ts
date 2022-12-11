import { prisma, server } from "./setupDb";
import { users } from "./mockData/users";
import { vaults } from "./mockData/vaults";
import { nodes1, nodes2 } from "./mockData/nodes";
import { it, describe, expect, beforeAll } from "vitest";

describe("/api/user", () => {
  it("should create a user", async () => {
    const response = await server
      .post("/api/user")
      .send(users[0])
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    const [access_token, refresh_token] = response.headers["set-cookie"];

    expect(access_token).toBeDefined();
    expect(refresh_token).toBeDefined();
    expect(response.body.user.username).toEqual(users[0].username);
    expect(response.body.message).toEqual("User created!");

    expect(
      await prisma.user.findUnique({
        where: { username: response.body.user.username },
      })
    ).toBeDefined();
  });

  it("should throw an error if username already exists", async () => {
    await server
      .post("/api/user")
      .send(users[0])
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400);
  });

  it("should allow multiple users", async () => {
    const response = await server
      .post("/api/user")
      .send(users[1])
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    const [access_token, refresh_token] = response.headers["set-cookie"];

    expect(access_token).toBeDefined();
    expect(refresh_token).toBeDefined();
    expect(response.body.user.username).toEqual(users[1].username);
    expect(response.body.message).toEqual("User created!");
    expect(
      await prisma.user.findUnique({
        where: { username: response.body.user.username },
      })
    ).toBeDefined();
  });
});

describe("/api/login", () => {
  it("should login a user with the correct credentials", async () => {
    const response = await server
      .post("/api/login")
      .send(users[0])
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    const [access_token, refresh_token] = response.headers["set-cookie"];

    expect(access_token).toBeDefined();
    expect(refresh_token).toBeDefined();
  });

  it("should not login a user if credentials are incorrect", async () => {
    await server
      .post("/api/login")
      .send({ username: users[1].username, password: "thispasswordiswrong" })
      .expect(401);
  });

  it("should not login a user that does not exist", async () => {
    await server.post("/api/login").send(users[2]).expect(401);
  });
});

describe("/api/vault", async () => {
  it("should create a vault", async () => {
    const response = await server
      .put("/api/vault")
      .send({
        nodes: nodes1,
        vault: vaults[0].name,
      })
      .expect(200);

    expect(response.body.message).toEqual(
      "Vault TestingVault was successfully sync'd!"
    );
  });

  it("should get a vault", async () => {
    const response = await server
      .get(`/api/vault?vault=${vaults[0].name}`)
      .send({
        nodes: nodes1,
        vault: vaults[0].name,
      })
      .expect(200);
  });

  it("should return 404 if the vault was not found", async () => {
    const response = await server
      .get(`/api/vault?vault=${vaults[1].name}`)
      .expect(404);

    expect(response.body.error).toEqual(
      `No vault ${vaults[1].name} to send. Check the vault name and make sure you've sync'd at least once.`
    );
  });
  it("should return 400 if no vault was sent", async () => {
    const response = await server.get(`/api/vault?vault=`).expect(400);

    expect(response.body.error).toEqual(
      "No vault was sent in the request. Make sure the Vault is set in the plugin options"
    );
  });

  it("should return 401 if the user is unauthorized", async () => {
    // logout a user
    await server
      .post("/api/logout")
      .send({ username: users[0].username })
      .expect(200);
    1;
    await server.get(`/api/vault?vault=${vaults[0].name}`).expect(401);
  });
});

describe("/api/refresh_token", () => {
  it("should refresh tokens when a user is logged in", async () => {
    await server
      .post("/api/login")
      .send({ ...users[1] })
      .expect(200);
    const response = await server
      .post("/api/refresh_token")
      .send({ username: users[1].username })
      .expect(200);

    expect(response.body.message).toEqual("Tokens Refreshed");
  });

  it("should send a 401 if the session is expired", async () => {
    await prisma.user.update({
      where: {
        username: users[1].username,
      },
      data: {
        refreshToken: null,
      },
    });
    const response = await server
      .post("/api/refresh_token")
      .send({ username: users[1].username })
      .expect(401);

    expect(response.body.message).toEqual(
      "Session expired. Please log in again."
    );
  });
});

describe("/api/logout", () => {
  it("should logout a user", async () => {
    const response = await server
      .post("/api/logout")
      .send({ username: users[0].username })
      .expect(200);

    const [access_token, refresh_token] = response.headers["set-cookie"];

    expect(access_token).toEqual(
      "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None"
    );
    expect(refresh_token).toEqual(
      "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None"
    );
    expect(response.body.message).toEqual(
      `Logged out ${users[0].username} successfully!`
    );
  });

  it("should send a 404 if a username is not defined", async () => {
    await server
      .post("/api/logout")
      .send({ username: "thisuserdoesntexist" })
      .expect(404);
  });
});
