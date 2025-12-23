import type { InferSelectModel } from "drizzle-orm"; 
import { pgTable, uuid, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", { 
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").unique().notNull(),
    email: text("email").unique().notNull(), 
    password: text("password").notNull(),
    is_verified: boolean("is_verified").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(), 
});

export const otpCodes = pgTable("otp_codes", {
    id: uuid("id").defaultRandom().primaryKey(),
	email: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 6 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expires_at: timestamp("expires_at", { mode: 'string'}).notNull(),
});

export type Users = InferSelectModel<typeof users>;
export type OtpCodes = InferSelectModel<typeof otpCodes>