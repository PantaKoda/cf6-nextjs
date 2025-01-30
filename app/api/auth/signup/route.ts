// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .get();

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create new user
        await db.insert(users).values({
            email,
            password_hash: hashedPassword,
            display_name: email.split("@")[0], // Default display name from email
        });

        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}