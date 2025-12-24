import type { InferSelectModel } from "drizzle-orm"; 
import { pgTable, uuid, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";

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
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expires_at: timestamp("expires_at", { mode: 'string'}).notNull(),
});

export const exams = pgTable("exams", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    is_published: boolean("is_published").default(false),
    duration: integer("duration").notNull(),
    created_by: uuid("created_by").notNull().references(() => users.id),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

//export const questions = pgTable("questions", {
    //id: uuid("id").defaultRandom().primaryKey(),
    
//})

export type Users = InferSelectModel<typeof users>;
export type OtpCodes = InferSelectModel<typeof otpCodes>