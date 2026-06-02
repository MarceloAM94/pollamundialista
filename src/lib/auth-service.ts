import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { createToken } from "./auth";

const SALT_ROUNDS = 10;

export type UserData = {
  id: number;
  username: string;
  nombre: string;
  isAdmin: boolean;
};

export async function registerUser(
  username: string,
  password: string,
  nombre: string
): Promise<UserData> {
  const existing = await prisma.usuario.findUnique({ where: { username } });
  if (existing) {
    throw new Error("El nombre de usuario ya existe");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.usuario.create({
    data: { username, passwordHash, nombre },
  });

  return { id: user.id, username: user.username, nombre: user.nombre, isAdmin: user.isAdmin };
}

export async function loginUser(
  username: string,
  password: string
): Promise<{ user: UserData; token: string }> {
  const user = await prisma.usuario.findUnique({ where: { username } });
  if (!user || !user.activo) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const token = await createToken({
    userId: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      isAdmin: user.isAdmin,
    },
    token,
  };
}

export async function getUserById(id: number): Promise<UserData | null> {
  const user = await prisma.usuario.findUnique({ where: { id } });
  if (!user || !user.activo) return null;
  return { id: user.id, username: user.username, nombre: user.nombre, isAdmin: user.isAdmin };
}
