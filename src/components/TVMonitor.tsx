"use client"

import { motion, AnimatePresence } from "framer-motion"
import { GameState } from "@/types/Game"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Check, Clock, MoreVertical, HelpCircle, Globe } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface TVMonitorProps {
    gameState: GameState
    nextStep: () => void
    kickPlayer: (playerName: string) => void
}

export default function TVMonitor({ gameState, nextStep, kickPlayer }: TVMonitorProps) {
    const { round, players, iteration } = gameState

    const getStepAction = () => {
        switch (round?.step) {
            case "question": return "Start Choices"
            case "choices": return "Show First Hint"
            case "hint1": return "Show Second Hint"
            case "hint2": return "Show Solution"
            case "solution": return "Next Round"
            default: return "Next"
        }
    }

    const allChoicesMade = round?.step === "choices" && players.every(player => player.choice)
    const waitingCount = players.filter(p => !p.choice).length
    const totalPlayers = players.length

    if (!round) {
        return (
            <h1>Round not set</h1>
        )
    }

    return (
        <div className="flex flex-col w-screen min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Trivia Master</h1>
                <div className="text-3xl font-semibold">Round {iteration + 1}</div>
            </header>

            <div className="flex-1 flex gap-8 w-full">
                <Card className="flex-1 min-w-0 bg-white/10 backdrop-blur-md border-none text-white overflow-hidden">
                    <CardContent className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={round?.question}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <div className="bg-indigo-900/50 p-6 rounded-lg shadow-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-2xl font-semibold">Question:</h2>
                                        <div className="flex space-x-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="icon">
                                                        <HelpCircle className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80">
                                                    <div className="grid gap-4">
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium leading-none">Confidence Scores</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Claude: {round.confidence.claude}%<br />
                                                                GPT: {round.confidence.gpt}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="icon">
                                                        <Globe className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80">
                                                    <div className="grid gap-4">
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium leading-none">Original Question (English)</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {round.question_english}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <p className="text-3xl">{round?.question}</p>
                                </div>

                                {(round?.step === "hint1" || round?.step === "hint2" || round.step === "solution") && (
                                    <div className="bg-yellow-700/50 p-6 rounded-lg shadow-lg">
                                        <h3 className="text-xl font-semibold mb-2">Hint 1:</h3>
                                        <p className="text-2xl">{round?.hint1}</p>
                                    </div>
                                )}

                                {(round?.step === "hint2" || round?.step === "solution") && (
                                    <div className="bg-orange-700/50 p-6 rounded-lg shadow-lg">
                                        <h3 className="text-xl font-semibold mb-2">Hint 2:</h3>
                                        <p className="text-2xl">{round.hint2}</p>
                                    </div>
                                )}

                                {round?.step === "solution" && (
                                    <>
                                        <div className="bg-green-700/50 p-6 rounded-lg shadow-lg">
                                            <h3 className="text-xl font-semibold mb-2">Solution:</h3>
                                            <p className="text-2xl">{round.solution}</p>
                                        </div>

                                        <div className="bg-blue-900/50 p-6 rounded-lg shadow-lg">
                                            <h3 className="text-xl font-semibold mb-2">Player Answers:</h3>
                                            <ul className="space-y-2">
                                                {players.map((player) => (
                                                    <li key={player.name} className="flex items-center gap-2">
                                                        <Avatar className="w-8 h-8" style={{ backgroundColor: player.color }}>
                                                            <AvatarFallback className="text-white">
                                                                {player.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-semibold">{player.name}:</span>
                                                        <span>{player.choice || "No answer"}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </CardContent>
                </Card>

                <Card className="w-1/3 max-w-md bg-white/10 backdrop-blur-md border-none text-white">
                    <CardContent className="p-6">
                        <h2 className="text-3xl font-semibold mb-4">Lobby</h2>
                        <div className="space-y-4">
                            {players.map((player) => (
                                <div key={player.name} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg">
                                    <Avatar className="w-10 h-10 shadow shadow-black/40 opacity-80">
                                        <AvatarFallback className="font-semibold text-white text-shadow-md text-lg" style={{ background: player.color }}>
                                            {player.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-lg">{player.name}</span>
                                        </div>
                                        {round?.step === "choices" && (
                                            <div className="text-sm mt-1">
                                                {player.choice ? (
                                                    <span className="text-green-400 flex items-center">
                                                        <Check className="w-4 h-4 mr-1" /> Answer submitted
                                                    </span>
                                                ) : (
                                                    <span className="text-yellow-400 flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" /> Waiting for answer
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                    {round?.step.charAt(0).toUpperCase() + round?.step.slice(1)} Phase
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        size="lg"
                        onClick={nextStep}
                        className="text-xl px-8 py-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-xl border border-indigo-500/20"
                        disabled={round?.step === "choices" && !allChoicesMade}
                    >
                        {round?.step === "choices" && !allChoicesMade ? (
                            <>Waiting: {waitingCount}/{totalPlayers}</>
                        ) : (
                            <>
                                {getStepAction()} <ChevronRight className="ml-2 h-6 w-6" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}


