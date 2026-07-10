declare namespace Express {
  export interface Request {
    actorId?: string;
    actorName?: string;
    actorRole?: "SUPERADMIN" | "ADMIN" | "USER";
    requestId?: string;
  }
}
