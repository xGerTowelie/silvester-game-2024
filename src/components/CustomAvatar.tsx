'use client'

import React from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "framer-motion"

type AnimationType = 'glitch' | 'colorShift' | 'neonPulse' | 'dimensionalRift' | 'holographicFlicker' | 'geometricTransform' | 'cosmicWarp' | 'quantumFluctuation' | 'electricSurge' | 'fractalize' | 'vortexPull' | 'chromaticAberration' | 'gravitationalLens' | 'none'

interface CustomAvatarProps {
    name: string
    color: string
    size?: number
    animation?: AnimationType
}

const animations = {
    glitch: {
        x: [0, -2, 2, -2, 2, 0],
        y: [0, 1, -1, 1, -1, 0],
        filter: [
            'hue-rotate(0deg)',
            'hue-rotate(90deg)',
            'hue-rotate(180deg)',
            'hue-rotate(270deg)',
            'hue-rotate(0deg)',
        ],
        transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
        },
    },
    colorShift: {
        filter: [
            'hue-rotate(0deg)',
            'hue-rotate(90deg)',
            'hue-rotate(180deg)',
            'hue-rotate(270deg)',
            'hue-rotate(360deg)',
        ],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: "linear",
        },
    },
    neonPulse: {
        boxShadow: (color: string) => [
            `0 0 5px ${color}, 0 0 10px ${color}, 0 0 15px ${color}, 0 0 20px ${color}, 0 0 35px ${color}`,
            `0 0 2px ${color}, 0 0 5px ${color}, 0 0 7px ${color}, 0 0 10px ${color}, 0 0 17px ${color}`,
        ],
        transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
        },
    },
    dimensionalRift: {
        rotateY: [0, 180],
        scale: [1, 0.5, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
        },
    },
    holographicFlicker: {
        opacity: [1, 0.7, 0.9, 0.8, 1],
        filter: [
            'brightness(100%) contrast(100%) saturate(100%)',
            'brightness(150%) contrast(120%) saturate(150%)',
            'brightness(80%) contrast(90%) saturate(80%)',
            'brightness(120%) contrast(110%) saturate(120%)',
            'brightness(100%) contrast(100%) saturate(100%)',
        ],
        scale: [1, 1.05, 0.95, 1.02, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
        },
    },
    geometricTransform: {
        clipPath: [
            'circle(50% at 50% 50%)',
            'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
            'circle(50% at 50% 50%)',
        ],
        rotate: [0, 90, 180, 270, 360],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
    cosmicWarp: {
        scale: [1, 1.2, 0.8, 1.1, 1],
        rotate: [0, 15, -15, 5, 0],
        filter: [
            'hue-rotate(0deg) blur(0px)',
            'hue-rotate(90deg) blur(1px)',
            'hue-rotate(180deg) blur(2px)',
            'hue-rotate(270deg) blur(1px)',
            'hue-rotate(360deg) blur(0px)',
        ],
        transition: {
            duration: 5,
            repeat: Infinity,
        },
    },
    quantumFluctuation: {
        scale: [1, 1.2, 0.8, 1.1, 0.9, 1],
        x: [0, 5, -5, 3, -3, 0],
        y: [0, -5, 5, -3, 3, 0],
        rotate: [0, 10, -10, 5, -5, 0],
        filter: [
            'blur(0px) brightness(100%)',
            'blur(1px) brightness(150%)',
            'blur(2px) brightness(50%)',
            'blur(1px) brightness(125%)',
            'blur(0px) brightness(75%)',
            'blur(0px) brightness(100%)',
        ],
        transition: {
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
        },
    },
    electricSurge: {
        scale: [1, 1.05, 0.95, 1.1, 0.9, 1],
        boxShadow: (color: string) => [
            `0 0 0 0 ${color}`,
            `0 0 10px 5px ${color}`,
            `0 0 20px 10px ${color}`,
            `0 0 30px 15px ${color}`,
            `0 0 40px 20px ${color}`,
            `0 0 0 0 ${color}`,
        ],
        filter: [
            'brightness(100%) contrast(100%)',
            'brightness(150%) contrast(120%)',
            'brightness(200%) contrast(150%)',
            'brightness(150%) contrast(120%)',
            'brightness(100%) contrast(100%)',
        ],
        transition: {
            duration: 1,
            repeat: Infinity,
        },
    },
    fractalize: {
        scale: [1, 1.5, 1],
        rotate: [0, 180, 360],
        borderRadius: ['50%', '60% 40% 70% 30% / 30% 30% 70% 70%', '50%'],
        filter: [
            'hue-rotate(0deg) saturate(100%)',
            'hue-rotate(180deg) saturate(200%)',
            'hue-rotate(360deg) saturate(100%)',
        ],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
    vortexPull: {
        scale: [1, 0.5, 1],
        rotate: [0, 720],
        borderRadius: ['50%', '0%', '50%'],
        filter: [
            'blur(0px) brightness(100%)',
            'blur(5px) brightness(150%)',
            'blur(0px) brightness(100%)',
        ],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
    chromaticAberration: {
        scale: [1, 1.05, 0.95, 1],
        rotate: [0, 5, -5, 0],
        filter: [
            'blur(0px) contrast(100%)',
            'blur(2px) contrast(150%) hue-rotate(45deg)',
            'blur(4px) contrast(200%) hue-rotate(90deg)',
            'blur(2px) contrast(150%) hue-rotate(45deg)',
            'blur(0px) contrast(100%)',
        ],
        transition: {
            duration: 3,
            repeat: Infinity,
        },
    },
    gravitationalLens: {
        scale: [1, 1.2, 0.8, 1],
        borderRadius: ['50%', '40% 60% 60% 40% / 60% 30% 70% 40%', '50%'],
        rotate: [0, 45, -45, 0],
        filter: [
            'blur(0px) brightness(100%)',
            'blur(3px) brightness(150%)',
            'blur(6px) brightness(200%)',
            'blur(3px) brightness(150%)',
            'blur(0px) brightness(100%)',
        ],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
    none: {},
}

export function CustomAvatar({ name, color, size = 32, animation = 'none' }: CustomAvatarProps) {
    const initials = name.charAt(0).toUpperCase()

    return (
        <motion.div
            animate={animation === 'neonPulse' || animation === 'electricSurge'
                ? { ...animations[animation], boxShadow: animations[animation].boxShadow(color) }
                : animations[animation]}
            className="rounded-full overflow-hidden shadow shadow-black/40"
            style={{ width: size, height: size }}
        >
            <Avatar className="w-full h-full">
                <AvatarFallback
                    className="text-white text-shadow-md font-semibold flex items-center justify-center"
                    style={{ background: color, color: "white", fontSize: `${size / 2}px` }}
                >
                    {initials}
                </AvatarFallback>
            </Avatar>
        </motion.div>
    )
}


