import { Prisma } from "@prisma/client";

export const users: Prisma.UserCreateInput[] = [
  {
    username: "Smokey Muffins",
    password: "aj3^fkO3U#jw@#%FFle#@",
  },
  {
    username: "teapot42069",
    password: "notverysecure",
  },
];
