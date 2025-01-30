"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"


export default function WelcomePage() {
    const router = useRouter()


    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/")
        }, 10000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Welcome to Agean Traffic!</CardTitle>
                    <CardDescription>Your account has been successfully created.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center mb-4">
                        Thank you for joining us. You can now track ships in the Aegean Sea and access all our features.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>View real-time ship positions</li>
                        <li>Get detailed information about vessels</li>
                        <li>Set up custom alerts</li>
                    </ul>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button onClick={() => router.push("/")}>Start Exploring</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

