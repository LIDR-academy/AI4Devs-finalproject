import { createHmac, timingSafeEqual } from "node:crypto";

type AuthTokenPayload = {
  sub: string;
  name: string;
  role: "SUPERADMIN" | "ADMIN" | "USER";
  type: "access" | "refresh";
  ver: number;
  iat: number;
  exp: number;
};

const encodeBase64Url = (value: string) => {
  return Buffer.from(value, "utf8").toString("base64url");
};

const decodeBase64Url = (value: string) => {
  return Buffer.from(value, "base64url").toString("utf8");
};

const sign = (value: string, secret: string) => {
  return createHmac("sha256", secret).update(value).digest("base64url");
};

export const createAuthToken = (payload: AuthTokenPayload, secret: string) => {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(signingInput, secret);

  return `${signingInput}.${signature}`;
};

export const verifyAuthToken = (token: string, secret: string) => {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = sign(signingInput, secret);

  const provided = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as Partial<AuthTokenPayload>;

    if (!payload.sub || !payload.name || !payload.role || !payload.exp || !payload.iat || typeof payload.ver !== "number") {
      return null;
    }

    if (payload.role !== "SUPERADMIN" && payload.role !== "ADMIN" && payload.role !== "USER") {
      return null;
    }

    if (payload.type !== "access" && payload.type !== "refresh") {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
};

export const createAccessToken = (
  input: { sub: string; name: string; role: "SUPERADMIN" | "ADMIN" | "USER"; ver: number; iat: number; exp: number },
  secret: string
) => {
  return createAuthToken(
    {
      ...input,
      type: "access"
    },
    secret
  );
};

export const createRefreshToken = (
  input: { sub: string; name: string; role: "SUPERADMIN" | "ADMIN" | "USER"; ver: number; iat: number; exp: number },
  secret: string
) => {
  return createAuthToken(
    {
      ...input,
      type: "refresh"
    },
    secret
  );
};
