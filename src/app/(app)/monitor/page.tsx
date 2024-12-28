"use client"

import DebugState from "@/components/DebugState"
import IterationCounter from "@/components/IterationCounter"
import RoundDisplay from "@/components/RoundDisplay"
import Sidebar from "@/components/Sidebar"
import { PlayerChoiceEvent, PlayerJoinedEvent, PlayerLeftEvent } from "@/types/Events"
import { Choice, GameState } from "@/types/Game"
import { useEffect, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"

const initialGameState: GameState = {
    round: {
        step: "question",
        question: "How old was Albert Einstein when he received his first nobel price?",
        hint1: "He was younger than Angela Merkel when she became German Kanzler",
        hint2: "He was older than 30.",
        solution: "42"
    },
    players: [],
    iteration: 0
}

export default function Monitor() {
    const [socket, setSocket] = useState<Socket | undefined>(undefined)
    const [gameState, setGameState] = useState(initialGameState)
    const [playerChoices, setPlayerChoices] = useState<Array<Choice>>([])

    // websocket calls
    const requestChoices = useCallback(() => {
        if (!socket) {
            throw new Error("No socket exists...")
        }
        socket.emit("request_choices")
        console.log("Choices were requested.")
    }, [socket])

    const requestNewRound = useCallback(() => {
        setGameState(prev => ({ ...prev, round: { ...prev.round, question: "new question" } }))
    }, [])

    // connect and disconnect on unmount
    useEffect(() => {
        const newSocket = io("http://localhost:3001")
        console.log("Socket connection established.")
        setSocket(newSocket)

        newSocket.emit("monitor")

        return () => {
            newSocket.disconnect()
            console.log("Socket connection disconnected.")
        }
    }, [])

    useEffect(() => {
        if (!socket) return

        const handlePlayerJoined = (event: PlayerJoinedEvent) => {
            setGameState((prev) => {
                const found = prev.players.find(player => player.name === event.player.name)
                if (!found) {
                    console.log(`New player ${event.player.name} joined the game!`)
                    return { ...prev, players: [...prev.players, event.player] }
                }
                return prev
            })
        }

        const handlePlayerLeft = (event: PlayerLeftEvent) => {
            setGameState((prev) => {
                const newPlayers = prev.players.filter(player => player.name !== event.name)
                if (newPlayers.length !== prev.players.length) {
                    console.log(`Player ${event.name} left the game!`)
                    return { ...prev, players: newPlayers }
                }
                return prev
            })
        }

        const handlePlayerChoice = (event: PlayerChoiceEvent) => {
            setPlayerChoices((prev) => {
                const index = prev.findIndex(choice => choice.playerName === event.choice.playerName)
                if (index !== -1) {
                    console.log(`Player ${event.choice.playerName} updated their choice!`)
                    return prev.map((choice, i) => i === index ? event.choice : choice)
                } else {
                    console.log(`Player ${event.choice.playerName} submitted their choice!`)
                    return [...prev, event.choice]
                }
            })
        }

        // react to websocket messages
        socket.on("player_joined", handlePlayerJoined)
        socket.on("player_left", handlePlayerLeft)
        socket.on("player_choice", handlePlayerChoice)

        return () => {
            socket.off("player_joined", handlePlayerJoined)
            socket.off("player_left", handlePlayerLeft)
            socket.off("player_choice", handlePlayerChoice)
        }
    }, [socket])

    return (
        <div>
            <DebugState state={gameState} title="GameState" />
            <IterationCounter iteration={gameState.iteration} />
            <RoundDisplay
                requestNewRound={requestNewRound}
                newRound={gameState.round}
                requestChoices={requestChoices}
                updateGameState={setGameState}
            />
            <Sidebar players={gameState.players} />
        </div>
    )
}


