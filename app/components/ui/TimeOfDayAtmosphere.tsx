"use client";

import { useEffect, useState } from "react";

type TimeOfDay = "dawn" | "day" | "dusk" | "night";

type AtmosphereConfig = {
    fogColor: string;
    skyColor: string;
    particleColor: string;
    ambientLight: number;
};

const atmospherePresets: Record<TimeOfDay, AtmosphereConfig> = {
    dawn: {
        fogColor: "#2a1a4a",
        skyColor: "#4a2a6a",
        particleColor: "#ffd89b",
        ambientLight: 0.6,
    },
    day: {
        fogColor: "#050a10",
        skyColor: "#1a2a3a",
        particleColor: "#34d399",
        ambientLight: 1.0,
    },
    dusk: {
        fogColor: "#3a1a2a",
        skyColor: "#5a2a4a",
        particleColor: "#ff9a76",
        ambientLight: 0.7,
    },
    night: {
        fogColor: "#0a0515",
        skyColor: "#1a152a",
        particleColor: "#a78bfa",
        ambientLight: 0.4,
    },
};

function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 8) return "dawn";
    if (hour >= 8 && hour < 17) return "day";
    if (hour >= 17 && hour < 20) return "dusk";
    return "night";
}

export function useTimeOfDayAtmosphere() {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
    const [atmosphere, setAtmosphere] = useState<AtmosphereConfig>(atmospherePresets.day);

    useEffect(() => {
        const updateTime = () => {
            const newTimeOfDay = getTimeOfDay();
            setTimeOfDay(newTimeOfDay);
            setAtmosphere(atmospherePresets[newTimeOfDay]);
        };

        // Initial update
        updateTime();

        // Update every minute
        const interval = setInterval(updateTime, 60000);

        return () => clearInterval(interval);
    }, []);

    return { timeOfDay, atmosphere };
}

// Component to inject CSS variables for atmosphere
export function TimeOfDayAtmosphere() {
    const { atmosphere } = useTimeOfDayAtmosphere();

    useEffect(() => {
        document.documentElement.style.setProperty("--fog-color", atmosphere.fogColor);
        document.documentElement.style.setProperty("--sky-color", atmosphere.skyColor);
        document.documentElement.style.setProperty("--particle-color", atmosphere.particleColor);
        document.documentElement.style.setProperty("--ambient-light", atmosphere.ambientLight.toString());
    }, [atmosphere]);

    return null;
}
