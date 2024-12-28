"use client"

import DebugState from "@/components/DebugState"
import IterationCounter from "@/components/IterationCounter"
import RoundDisplay from "@/components/RoundDisplay"
import Sidebar from "@/components/Sidebar"
import { PlayerChoiceEvent, PlayerJoinedEvent, PlayerLeftEvent } from "@/types/Events"
import { Choice, GameState } from "@/types/Game"
import { useEffect, useState } from "react"
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
    const requestChoices = () => {
        if (!socket) {
            throw new Error("No socket exists...")
        }
        socket.emit("request_choices")
        console.log("Choices were requested.")
    }


    const requestNewRound = () => {
        setGameState(prev => ({ ...prev, round: { ...prev.round, question: "new question" } }))
    }

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
            const found = gameState.players.find(player => player.name === event.player.name)
            console.log(event.player.name, gameState.players)
            if (!found) {
                setGameState((prev) => ({ ...prev, players: [...prev.players, event.player] }))
                console.log(`New player ${event.player} joined the game!`)
            }
        }

        const handlePlayerLeft = (event: PlayerLeftEvent) => {
            const found = gameState.players.findIndex(player => player.name === event.name)

            if (found) {
                gameState.players.slice(found)
                console.log(`Player ${event.name} left the game!`)
            }
        }

        const handlePlayerChoice = (event: PlayerChoiceEvent) => {
            const found = playerChoices.findIndex(choice => choice.playerName === event.choice.playerName)
            const newChoices = playerChoices

            console.log(`Player ${event.choice.playerName} submitted his choice!`)

            if (found) {
                newChoices[found] = event.choice
            } else {
                newChoices.push(event.choice)
            }

            setPlayerChoices(newChoices)
            console.log("Choices were updated.")
        }

        // react to websocket messages
        socket.on("player_joined", handlePlayerJoined)
        socket.on("player_left", handlePlayerLeft)
        socket.on("player_choice", handlePlayerChoice)
    }, [socket, gameState, gameState.players, playerChoices])


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
