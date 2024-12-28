"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameState, Player } from "@/types/Game"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Trophy, Check, Clock, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TVMonitorProps {
    gameState: GameState
    nextStep: () => void
    kickPlayer: (playerName: string) => void
}

export default function TVMonitor({ gameState, nextStep, kickPlayer }: TVMonitorProps) {
    const [timeLeft, setTimeLeft] = useState(30)
    const { round, players, iteration } = gameState

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
        }, 1000)

        return () => clearInterval(timer)
    }, [round.step])

    const getStepAction = () => {
        switch (round.step) {
            case "question":
                return "Start Choices"
            case "choices":
                return "Show First Hint"
            case "hint1":
                return "Start First Bet"
            case "bet1":
                return "Show Second Hint"
            case "hint2":
                return "Start Second Bet"
            case "bet2":
                return "Show Solution"
            case "solution":
                return "Next Round"
            default:
                return "Next"
        }
    }

    const allChoicesMade = round.step === "choices" && players.every(player => player.choice)

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Trivia Master</h1>
                <div className="text-2xl">Round {iteration + 1}</div>
            </header>

            <div className="flex-1 flex gap-8">
                <Card className="flex-1 bg-white/10 backdrop-blur-md border-none text-white">
                    <CardHeader>
                        <CardTitle className="text-3xl">Question</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={round.question}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                {round.question}
                            </motion.div>
                        </AnimatePresence>
                        {(round.step === "hint1" || round.step === "bet1" || round.step === "hint2" || round.step === "bet2" || round.step === "solution") && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 text-xl text-yellow-300"
                            >
                                Hint 1: {round.hint1}
                            </motion.div>
                        )}
                        {(round.step === "hint2" || round.step === "bet2" || round.step === "solution") && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-2 text-xl text-yellow-300"
                            >
                                Hint 2: {round.hint2}
                            </motion.div>
                        )}
                        {round.step === "solution" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 text-2xl text-green-300"
                            >
                                Solution: {round.solution}
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                <Card className="w-1/3 bg-white/10 backdrop-blur-md border-none text-white">
                    <CardHeader>
                        <CardTitle className="text-3xl">Leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {players
                                .sort((a, b) => b.coins - a.coins)
                                .map((player, index) => (
                                    <div key={player.name} className="flex items-center gap-4">
                                        {index === 0 && <Trophy className="text-yellow-400" />}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-8 h-8" style={{ backgroundColor: player.color }}>
                                                    <AvatarFallback className="text-white">
                                                        {player.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-semibold text-white">{player.name}</span>
                                                <span className="ml-auto">{player.coins} coins</span>
                                                {round.step === "choices" && (
                                                    player.choice ? <Check className="text-green-500" /> : <Clock className="text-yellow-500" />
                                                )}
                                            </div>
                                            <Progress value={(player.coins / 1000) * 100} className="h-2" />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => kickPlayer(player.name)}>
                                                    Kick Player
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <div className="text-3xl font-bold">
                    {round.step.charAt(0).toUpperCase() + round.step.slice(1)} Phase
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-2xl">Time Left: {timeLeft}s</div>
                    <Button
                        size="lg"
                        onClick={() => {
                            nextStep()
                            setTimeLeft(30)
                        }}
                        className="text-xl px-6 py-8 bg-green-500 hover:bg-green-600"
                        disabled={round.step === "choices" && !allChoicesMade}
                    >
                        {getStepAction()} <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

