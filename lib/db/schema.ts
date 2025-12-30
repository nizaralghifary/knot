import type { InferSelectModel } from "drizzle-orm"; 
import { pgTable, pgEnum, uuid, text, timestamp, varchar, boolean, integer, jsonb } from "drizzle-orm/pg-core";

// role
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

export const users = pgTable("users", { 
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").unique().notNull(),
    email: text("email").unique().notNull(), 
    password: text("password").notNull(),
    role: userRoleEnum("role").default("user").notNull(),
    is_verified: boolean("is_verified").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const otpCodes = pgTable("otp_codes", {
    id: uuid("id").defaultRandom().primaryKey(),
	email: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 64 }).notNull(),
    attempts: integer("attempts").default(0).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	expires_at: timestamp("expires_at").notNull()
});

export const exams = pgTable("exams", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    is_published: boolean("is_published").default(false),
    duration: integer("duration").notNull(),
    created_by: uuid("created_by").notNull().references(() => users.id),
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const questions = pgTable("questions", {
    id: uuid("id").defaultRandom().primaryKey(),
    exam_id: uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
    question_text: text("question_text").notNull(),
    question_type: varchar("question_type", { length: 20 }).notNull(), // 'multiple_choice', 'short_answer', 'matching'
    options: jsonb("options"),
    correct_answer: jsonb("correct_answer").notNull(),
    points: integer("points").notNull().default(1),
    order: integer("order").notNull(), // urutan soal
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const answers = pgTable("answers", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    question_id: uuid("question_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
    user_answer: jsonb("user_answer").notNull(),
    is_correct: boolean("is_correct").notNull(),
    points_earned: integer("points_earned").notNull().default(0),
    answered_at: timestamp("answered_at").defaultNow().notNull()
});

export const examAttempts = pgTable("exam_attempts", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    exam_id: uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
    started_at: timestamp("started_at").defaultNow().notNull(),
    completed_at: timestamp("completed_at"),
    total_score: integer("total_score").default(0),
    is_completed: boolean("is_completed").default(false).notNull()
});

export type Users = InferSelectModel<typeof users>;
export type OtpCodes = InferSelectModel<typeof otpCodes>;
export type Exams = InferSelectModel<typeof exams>;
export type Questions = InferSelectModel<typeof questions>;
export type Answers = InferSelectModel<typeof answers>;
export type ExamAttempts = InferSelectModel<typeof examAttempts>;