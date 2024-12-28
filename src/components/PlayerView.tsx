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
                {gameState !== "choices" && (
                    <p className="text-center text-lg">Wait for the next question.</p>
                )}
            </CardContent>
        </Card>
    )
}


