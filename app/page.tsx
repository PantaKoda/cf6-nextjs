import { Suspense } from "react"
import MapPanel from "./components/MapPanel"
import { AnimatedCounter } from "./components/AnimatedCounter"

export default function Home() {
    return (
        <main className="flex-grow">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Aegean Traffic</h1>
                <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">Watch and track ships in the Aegean Sea</p>
                <AnimatedCounter />
                <Suspense fallback={<div>Loading map...</div>}>
                    <MapPanel />
                </Suspense>
            </div>
        </main>
    )
}

