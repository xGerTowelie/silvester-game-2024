"use client"

import { useEffect, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import DebugState from "@/components/DebugState"
import IterationCounter from "@/components/IterationCounter"
import RoundDisplay from "@/components/RoundDisplay"
import Sidebar from "@/components/Sidebar"
import { GameUpdateEvent, PlayerChoiceEvent, PlayerJoinedEvent, PlayerLeftEvent, PlayerBetEvent } from "@/types/Events"
import { GameState } from "@/types/Game"

const initialGameState: GameState = {
    round: {
        step: "question",
        question: "How old was Albert Einstein when he received his first Nobel Prize?",
        hint1: "He was younger than Angela Merkel when she became German Chancellor",
        hint2: "He was older than 30.",
        solution: "42"
    },
    players: [],
    iteration: 0
}

export default function Monitor() {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [gameState, setGameState] = useState<GameState>(initialGameState)

    const nextStep = useCallback(() => {
        if (socket) {
            socket.emit("next_step")
        }
    }, [socket])

    useEffect(() => {
        const newSocket = io("http://localhost:3001")
        setSocket(newSocket)

        newSocket.on("connect", () => {
            console.log("Socket connection established.")
            newSocket.emit("monitor")
        })

        newSocket.on("game_state_update", (event: GameUpdateEvent) => {
            console.log("Received game state update:", event.game)
            setGameState(event.game)
        })

        newSocket.on("player_joined", (event: PlayerJoinedEvent) => {
            console.log(`New player ${event.player.name} joined the game!`)
            setGameState(prevState => ({
                ...prevState,
                players: [...prevState.players, event.player]
            }))
        })

        newSocket.on("player_left", (event: PlayerLeftEvent) => {
            console.log(`Player ${event.name} left the game!`)
            setGameState(prevState => ({
                ...prevState,
                players: prevState.players.filter(player => player.name !== event.name)
            }))
        })

        newSocket.on("player_choice", (event: PlayerChoiceEvent) => {
            console.log(`Player ${event.choice.playerName} made a choice: ${event.choice.value}`)
            setGameState(prevState => ({
                ...prevState,
                players: prevState.players.map(player =>
                    player.name === event.choice.playerName
                        ? { ...player, choice: event.choice.value }
                        : player
                )
            }))
        })

        newSocket.on("player_bet", (event: PlayerBetEvent) => {
            console.log(`Player ${event.bet.playerName} made a bet: ${event.bet.value}`)
            setGameState(prevState => ({
                ...prevState,
                players: prevState.players.map(player =>
                    player.name === event.bet.playerName
                        ? { ...player, [prevState.round.step === "bet1" ? "bet1" : "bet2"]: event.bet.value }
                        : player
                )
            }))
        })

        return () => {
            newSocket.disconnect()
            console.log("Socket connection disconnected.")
        }
    }, [])

    return (
        <div className="p-4 flex flex-col h-screen">
            <DebugState state={gameState} title="GameState" />
            <div className="flex-grow flex">
                <div className="flex-grow">
                    <IterationCounter iteration={gameState.iteration} />
                    <RoundDisplay
                        gameState={gameState}
                        nextStep={nextStep}
                    />
                </div>
                <Sidebar players={gameState.players} />
            </div>
        </div>
    )
}


