"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "./google-icon";
import { signIn } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormData {
    email: string;
    password: string;
}

interface ValidationErrors {
    email?: string;
    password?: string;
    general?: string;
}

export function SignUpModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name as keyof ValidationErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (error) {
            setErrors({ general: "Failed to sign in with Google. Please try again." });
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to sign up");
            }

            // Sign in the user after successful registration
            await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                callbackUrl: "/welcome",
            });
        } catch (error) {
            setErrors({
                general: error instanceof Error ? error.message : "An error occurred during sign up",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">Sign Up</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sign Up</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEmailSignUp} className="grid gap-4 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleSignUp}
                        disabled={isLoading}
                    >
                        <GoogleIcon className="mr-2 h-5 w-5" />
                        Sign up with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
                        </div>
                    </div>

                    {errors.general && (
                        <Alert variant="destructive">
                            <AlertDescription>{errors.general}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <span className="text-sm text-red-500">{errors.email}</span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <span className="text-sm text-red-500">{errors.password}</span>
                        )}
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}