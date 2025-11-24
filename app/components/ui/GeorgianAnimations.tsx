"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type GeorgianCrossPatternProps = {
    children: ReactNode;
};

/**
 * Georgian Cross Pattern Reveal
 * Inspired by traditional Georgian cross motifs found in architecture and artifacts
 */
export function GeorgianCrossPattern({ children }: GeorgianCrossPatternProps) {
    return (
        <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
        >
            {/* Animated cross pattern overlay */}
            <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: [0, 0.3, 0],
                        transition: { duration: 2, delay: 0.2 }
                    }
                }}
            >
                {/* Vertical beam */}
                <motion.div
                    className="absolute left-1/2 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-emerald-400 to-transparent"
                    variants={{
                        hidden: { scaleY: 0 },
                        visible: {
                            scaleY: 1,
                            transition: { duration: 0.8, ease: "easeOut" }
                        }
                    }}
                />
                {/* Horizontal beam */}
                <motion.div
                    className="absolute top-1/2 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                    variants={{
                        hidden: { scaleX: 0 },
                        visible: {
                            scaleX: 1,
                            transition: { duration: 0.8, delay: 0.2, ease: "easeOut" }
                        }
                    }}
                />
            </motion.div>

            {/* Content with fade in */}
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.6, delay: 0.4 }
                    }
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

/**
 * Sword Glint Effect
 * Adds a metallic glint animation reminiscent of Georgian swords
 */
export function SwordGlint({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            className={`relative overflow-hidden ${className}`}
            whileHover="hover"
            initial="rest"
        >
            {/* Glint overlay */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                variants={{
                    rest: { x: "-100%", rotate: 45 },
                    hover: {
                        x: "200%",
                        rotate: 45,
                        transition: {
                            duration: 0.8,
                            ease: "easeInOut"
                        }
                    }
                }}
            >
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.div>

            {children}
        </motion.div>
    );
}

/**
 * Wine Pour Effect
 * Simulates wine pouring animation on hover
 */
export function WinePourEffect({ children }: { children: ReactNode }) {
    return (
        <motion.div
            className="relative"
            whileHover="pour"
            initial="empty"
        >
            {/* Wine fill animation from bottom */}
            <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit"
                variants={{
                    empty: { scaleY: 0 },
                    pour: {
                        scaleY: 1,
                        transition: {
                            duration: 1.2,
                            ease: [0.43, 0.13, 0.23, 0.96] // Custom easing for liquid effect
                        }
                    }
                }}
                style={{ transformOrigin: "bottom" }}
            >
                <div className="h-full w-full bg-gradient-to-t from-red-900/10 via-red-800/5 to-transparent" />
            </motion.div>

            {children}
        </motion.div>
    );
}

/**
 * Georgian Ornament Border
 * Animated borders with traditional Georgian patterns
 */
export function GeorgianOrnamentBorder({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            className={`relative ${className}`}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true }}
        >
            {/* Corner ornaments */}
            <motion.div
                className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500"
                variants={{
                    hidden: { scale: 0, opacity: 0 },
                    visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 0.5 }
                    },
                    hover: {
                        scale: 1.2,
                        transition: { duration: 0.3 }
                    }
                }}
            />
            <motion.div
                className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500"
                variants={{
                    hidden: { scale: 0, opacity: 0 },
                    visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 0.5, delay: 0.1 }
                    },
                    hover: {
                        scale: 1.2,
                        transition: { duration: 0.3 }
                    }
                }}
            />
            <motion.div
                className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500"
                variants={{
                    hidden: { scale: 0, opacity: 0 },
                    visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 0.5, delay: 0.2 }
                    },
                    hover: {
                        scale: 1.2,
                        transition: { duration: 0.3 }
                    }
                }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500"
                variants={{
                    hidden: { scale: 0, opacity: 0 },
                    visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 0.5, delay: 0.3 }
                    },
                    hover: {
                        scale: 1.2,
                        transition: { duration: 0.3 }
                    }
                }}
            />

            {children}
        </motion.div>
    );
}

/**
 * Depth Lift Effect
 * Professional 3D card lift with shadow
 */
export function DepthLift({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            className={className}
            whileHover={{
                y: -12,
                scale: 1.02,
                transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                }
            }}
            style={{
                transformStyle: "preserve-3d",
            }}
        >
            <motion.div
                whileHover={{
                    boxShadow: "0 25px 50px -12px rgba(52, 211, 153, 0.25), 0 0 0 1px rgba(52, 211, 153, 0.1)"
                }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
