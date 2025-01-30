"use client";

import { motion, useSpring, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import { useShipStore, ShipStore } from "@/store/shipStore";

export function AnimatedCounter() {
    const uniqueShipCount = useShipStore((state: ShipStore) => state.getUniqueShipCount());

    // Motion value that we update manually
    const animatedValue = useMotionValue(uniqueShipCount);
    const springValue = useSpring(animatedValue, { stiffness: 100, damping: 10 });

    // Whenever uniqueShipCount changes, update the motion value
    useEffect(() => {
        animatedValue.set(uniqueShipCount);
    }, [uniqueShipCount, animatedValue]);

    return (
        <div className="text-center mb-8">
            <p className="text-xl mb-2">Currently tracking</p>
            <div className="flex items-center justify-center space-x-2">
                {/* Use motion.span for animation */}
                <motion.span
                    className="text-5xl font-bold text-blue-600"
                    animate={{ opacity: [0.5, 1], scale: [0.9, 1] }}
                    transition={{ duration: 0.5 }}
                >
                    {Math.round(springValue.get())}
                </motion.span>
                <span className="text-3xl font-semibold">unique ships</span>
            </div>
        </div>
    );
}
