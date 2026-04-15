import bcrypt from "bcrypt";
import { BcryptCost } from "../constants/bcrypt";

/**
 * Hashes a plaintext password for storage.
 *
 * @param plainPassword Raw password from the client.
 * @returns bcrypt hash string.
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, BcryptCost.DefaultRounds);
};

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 *
 * @param plainPassword Raw password from the client.
 * @param hashedPassword Stored hash from the database.
 * @returns True when the password matches.
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
