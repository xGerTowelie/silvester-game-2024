"use client"

import { useState } from "react"
import { Socket } from "socket.io-client"
import { Player } from "@/types/Game"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <Card className="w-full max-w-screen-md mx-auto bg-white/10 backdrop-blur-md border-none text-white p-5 space-y-5">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="w-16 h-16 shadow shadow-black/40">
                    <AvatarFallback className="text-2xl text-white font-semibold text-shadow-md shadow-black shadow-2xl " style={{ background: player.color }}>
                        {player.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{player.name}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {gameState === "choices" && (
                    <form onSubmit={submitChoice} className="space-y-5">
                        <Input
                            type="text"
                            placeholder="Enter your answer"
                            value={choice}
                            onChange={(e) => setChoice(e.target.value)}
                            required
                            className="bg-white/20 text-2xl text-white placeholder-white/50"
                        />
                        <Button type="submit" className="w-full bg-white text-black font-semibold hover:bg-white/90">Submit Answer</Button>
                    </form>
                )}
                {gameState !== "choices" && (
                    <p className="text-center text-lg">Wait for the next question.</p>
                )}
            </CardContent>
        </Card>
    )
}


