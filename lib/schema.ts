import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";


export const users = sqliteTable("users", {
    user_id: integer("user_id").primaryKey({ autoIncrement: true }),
    email: text("email").unique().notNull(),
    password_hash: text("password_hash"),
    google_id: text("google_id"),
    display_name: text("display_name"),
    created_at: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
    updated_at: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});


