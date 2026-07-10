import { Request, Response, NextFunction } from "express";

type ActorRole = "SUPERADMIN" | "ADMIN" | "USER";

const hasRoleAccess = (current: ActorRole, allowed: ActorRole[]) => {
  return allowed.includes(current);
};

export const requireRoles = (allowed: ActorRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.actorRole;

    if (!role || !hasRoleAccess(role, allowed)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions"
      });
    }

    return next();
  };
};
