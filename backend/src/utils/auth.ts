import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
    throw new Error("JWT_SECRET is not configured");
})();

export function generateToken(userId: number, role: string): string {
    return jwt.sign(
        {
            userId,
            role
        },
        JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
}