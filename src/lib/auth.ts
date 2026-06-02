import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-no-usar-en-produccion"
);

export type TokenPayload = {
  userId: number;
  username: string;
  isAdmin: boolean;
};

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
