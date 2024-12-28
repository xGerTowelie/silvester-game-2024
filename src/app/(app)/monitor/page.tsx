"use client"

import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { GameState } from "@/types/Game"
import { rounds } from "@/types/rounds"
import TVMonitor from "@/components/TVMonitor"

const initialGameState: GameState = {
    round: rounds[0],
    players: [],
    iteration: 0
}

export default function Monitor() {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [gameState, setGameState] = useState<GameState>(initialGameState)

    useEffect(() => {
        const newSocket = io("http://localhost:3001")
        setSocket(newSocket)

        newSocket.on("connect", () => {
            console.log("Socket connection established.")
            newSocket.emit("monitor")
        })

        newSocket.on("game_state_update", (event: { game: GameState }) => {
            console.log("Received game state update:", event.game)
            setGameState(event.game)
        })

        return () => {
            newSocket.disconnect()
            console.log("Socket connection disconnected.")
        }
    }, [])

    const nextStep = () => {
        if (socket) {
            socket.emit("next_step")
        }
    }

    return (
        <TVMonitor gameState={gameState} nextStep={nextStep} />
    )
}


