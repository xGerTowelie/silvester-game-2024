"use client"

import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { Player, GameState } from "@/types/Game"
import PlayerView from "@/components/PlayerView"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Settings, Trophy } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"

const colorOptions = [
    { value: "red", label: "Red", bg: "from-red-700 to-red-900" },
    { value: "blue", label: "Blue", bg: "from-blue-700 to-blue-900" },
    { value: "green", label: "Green", bg: "from-green-700 to-green-900" },
    { value: "yellow", label: "Yellow", bg: "from-yellow-600 to-yellow-800" },
    { value: "purple", label: "Purple", bg: "from-purple-700 to-purple-900" },
    { value: "orange", label: "Orange", bg: "from-orange-600 to-orange-800" },
]

export default function PlayerPage() {
    const [name, setName] = useState("")
    const [color, setColor] = useState(colorOptions[0].value)
    const [player, setPlayer] = useState<Player | null>(null)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [isReconnecting, setIsReconnecting] = useState(false)

    useEffect(() => {
        const storedName = localStorage.getItem("playerName")
        const storedColor = localStorage.getItem("playerColor")
        if (storedName && storedColor) {
            setName(storedName)
            setColor(storedColor)
            connectToGame(storedName, storedColor)
        }
    }, [])

    const connectToGame = (playerName: string, playerColor: string) => {
        const newSocket = io("http://localhost:3001")
        setSocket(newSocket)

        newSocket.on("connect", () => {
            console.log("Socket connection established.")
            newSocket.emit("join", { name: playerName, color: playerColor }, (response) => {
                if (response.player) {
                    setPlayer(response.player)
                    localStorage.setItem("playerName", playerName)
                    localStorage.setItem("playerColor", playerColor)
                    toast({
                        title: "Connected to game",
                        description: `Welcome, ${response.player.name}!`,
                    })
                }
            })
        })

        newSocket.on("game_state_update", (event) => {
            setGameState(event.game)
            if (event.game.players) {
                const updatedPlayer = event.game.players.find(p => p.name === playerName)
                if (updatedPlayer) {
                    setPlayer(updatedPlayer)
                }
            }
        })

        newSocket.on("disconnect", () => {
            console.log("Disconnected from server. Attempting to reconnect...")
            setIsReconnecting(true)
        })

        newSocket.on("reconnect", () => {
            console.log("Reconnected to server")
            setIsReconnecting(false)
            newSocket.emit("join", { name: playerName, color: playerColor }, (response) => {
                if (response.player) {
                    setPlayer(response.player)
                }
            })
        })

        return newSocket
    }

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim() && color) {
            connectToGame(name.trim(), color)
        }
    }

    const handleReset = () => {
        localStorage.removeItem("playerName")
        localStorage.removeItem("playerColor")
        setName("")
        setColor(colorOptions[0].value)
        setPlayer(null)
        if (socket) {
            socket.disconnect()
        }
        toast({
            title: "Reset successful",
            description: "You've been disconnected from the game.",
        })
    }

    const bgColor = colorOptions.find(c => c.value === color)?.bg || colorOptions[0].bg

    if (isReconnecting) {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${bgColor} flex items-center justify-center p-4`}>
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-md">
                    <CardContent className="pt-6 flex flex-col items-center justify-center space-y-5">
                        <h1 className="text-3xl text-center text-white">Game closed</h1>
                        <Button onClick={() => window.location.reload()}>Reload</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!player) {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${bgColor} flex items-center justify-center p-4`}>
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-none">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-white">Join Trivia Master</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleJoin} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-white">
                                    Your Name
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-white/20 text-white placeholder-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="color" className="text-sm font-medium text-white">
                                    Choose Your Color
                                </label>
                                <Select value={color} onValueChange={setColor}>
                                    <SelectTrigger className="bg-white/20 text-white">
                                        <SelectValue placeholder="Select a color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colorOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">
                                Join Game
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${bgColor} p-4 flex flex-col`}>
            <nav className="flex justify-end mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Settings className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Settings</SheetTitle>
                            <SheetDescription>
                                Game settings and leaderboard
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-4 space-y-4">
                            <Button onClick={handleReset} variant="destructive" className="w-full">
                                Reset Game
                            </Button>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Leaderboard</h3>
                                {gameState && gameState.players.sort((a, b) => b.coins - a.coins).map((p, index) => (
                                    <div key={p.name} className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8" style={{ backgroundColor: p.color }}>
                                            <AvatarFallback className="text-white">
                                                {p.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{p.name}</span>
                                        <span className="ml-auto">{p.coins} coins</span>
                                        {index === 0 && <Trophy className="text-yellow-400 h-4 w-4" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
            <PlayerView
                player={player}
                gameState={gameState?.round.step || "waiting"}
                socket={socket}
            />
        </div>
    )
}

