"use client"

import { useEffect, useState, Suspense } from "react"
import { io, Socket } from "socket.io-client"
import { GameState } from "@/types/Game"
import TVMonitor from "@/components/TVMonitor"

export default function Monitor() {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [gameState, setGameState] = useState<GameState | null>(null)

    useEffect(() => {
        const socketUrl = process.env["NEXT_PUBLIC_SOCKET_URL"]
        const newSocket = io(socketUrl)
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

    const kickPlayer = () => {
        if (socket) {
            socket.emit("kick_player")
        }
    }

    return (
        <Suspense fallback={<h1>Loading Gamestate...</h1>}>
            {gameState ? (
                <TVMonitor gameState={gameState} nextStep={nextStep} kickPlayer={kickPlayer} />
            ) : (
                <h1>Waiting for initial game state...</h1>
            )}
        </Suspense>
    )
}


