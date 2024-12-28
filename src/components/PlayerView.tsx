"use client"

import { useState } from "react"
import { Socket } from "socket.io-client"
import { Player } from "@/types/Game"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"

type PlayerViewProps = {
    player: Player
    gameState: string
    socket: Socket | null
}

export default function PlayerView({ player, gameState, socket }: PlayerViewProps) {
    const [choice, setChoice] = useState("")
    const [bet, setBet] = useState("")

    const submitChoice = (e: React.FormEvent) => {
        e.preventDefault()
        if (socket && choice) {
            socket.emit("choice", { choice: { playerName: player.name, value: choice } })
            toast({
                title: "Choice submitted",
                description: `You chose: ${choice}`,
            })
            setChoice("")
        }
    }

    const submitBet = (e: React.FormEvent) => {
        e.preventDefault()
        if (socket && bet) {
            const betValue = parseInt(bet)
            if (isNaN(betValue) || betValue <= 0 || betValue > player.coins) {
                toast({
                    title: "Invalid bet",
                    description: "Please enter a valid bet amount.",
                    variant: "destructive",
                })
                return
            }
            socket.emit("bet", { bet: { playerName: player.name, value: betValue } })
            toast({
                title: "Bet placed",
                description: `You bet ${betValue} coins`,
            })
            setBet("")
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md border-none text-white">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="w-16 h-16" style={{ backgroundColor: player.color }}>
                    <AvatarFallback className="text-white">
                        {player.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{player.name}</CardTitle>
                    <CardDescription className="text-xl text-white/80">Coins: {player.coins}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {gameState === "waiting" && (
                    <p className="text-center text-lg">Waiting for the next step...</p>
                )}
                {gameState === "choices" && (
                    <form onSubmit={submitChoice} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Enter your answer"
                            value={choice}
                            onChange={(e) => setChoice(e.target.value)}
                            required
                            className="bg-white/20 text-white placeholder-white/50"
                        />
                        <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">Submit Answer</Button>
                    </form>
                )}
                {(gameState === "bet1" || gameState === "bet2") && (
                    <form onSubmit={submitBet} className="space-y-4">
                        <Input
                            type="number"
                            placeholder="Enter your bet"
                            value={bet}
                            onChange={(e) => setBet(e.target.value)}
                            min={1}
                            max={player.coins}
                            required
                            className="bg-white/20 text-white placeholder-white/50"
                        />
                        <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">Place Bet</Button>
                    </form>
                )}
                {(gameState === "hint1" || gameState === "hint2" || gameState === "solution") && (
                    <p className="text-center text-lg">Wait for the next betting round or the next question.</p>
                )}
            </CardContent>
        </Card>
    )
}


