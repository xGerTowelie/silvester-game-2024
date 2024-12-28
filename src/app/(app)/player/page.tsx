"use client"

import DebugState from "@/components/DebugState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GetPlayerByNameEvent, GetPlayerByNameEventResponse, JoinEvent, PlayerChoiceEvent, PlayerBetEvent } from "@/types/Events"
import { Player } from "@/types/Game"
import { RotateCwIcon } from 'lucide-react'
import { FormEvent, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

export default function PlayerPage() {
    const [name, setName] = useState("")
    const [player, setPlayer] = useState<Player | null>(null)
    const [socket, setSocket] = useState<Socket | undefined>(undefined)
    const [gameState, setGameState] = useState<string>("waiting")
    const [choice, setChoice] = useState("")
    const [bet, setBet] = useState("")

    const resetCache = () => {
        localStorage.clear()
        setPlayer(null)
        setName("")
    }

    const join = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!socket) {
            throw new Error("No socket set.")
        }

        const event: JoinEvent = { name: name }

        socket.emit("join", event, (response: GetPlayerByNameEventResponse) => {
            console.log(`Join result:`, response)
            if (response.player) {
                setPlayer(response.player)
                localStorage.setItem("player", response.player.name)
            }
        })
    }

    const submitChoice = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!socket || !player) {
            throw new Error("No socket or player set.")
        }

        const event: PlayerChoiceEvent = {
            choice: {
                playerName: player.name,
                value: choice
            }
        }

        socket.emit("choice", event)
        setChoice("")
        setGameState("waiting")
    }

    const submitBet = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!socket || !player) {
            throw new Error("No socket or player set.")
        }

        const event: PlayerBetEvent = {
            bet: {
                playerName: player.name,
                value: parseInt(bet)
            }
        }

        socket.emit("bet", event)
        setBet("")
        setGameState("waiting")
    }

    useEffect(() => {
        const newSocket = io("http://localhost:3001")
        console.log("Socket connection established.")
        setSocket(newSocket)

        const cachedPlayerName = localStorage.getItem("player")

        if (cachedPlayerName) {
            const cachePlayer: GetPlayerByNameEvent = { name: cachedPlayerName }
            newSocket.emit("get_player_by_name", cachePlayer, (response: GetPlayerByNameEventResponse) => {
                console.log(`Player lookup result:`, response)

                if (response.player) {
                    setPlayer(response.player)
                } else {
                    localStorage.removeItem("player")
                }
            })
        }

        newSocket.on("make_choice", () => {
            setGameState("make_choice")
        })

        newSocket.on("make_bet", () => {
            setGameState("make_bet")
        })

        return () => {
            newSocket.disconnect()
            console.log("Socket connection disconnected.")
        }
    }, [])

    if (!socket) {
        return <h1>Currently no game running...</h1>
    }

    return (
        <div className="flex flex-col space-y-4 p-5">
            <DebugState state={{ player, gameState }} title="Player State" />
            {player && <Button onClick={resetCache}><RotateCwIcon />Reset Cache</Button>}
            {!player && (
                <form onSubmit={join} className="space-y-4">
                    <h1 className="text-2xl font-bold">Please enter your name to join:</h1>
                    <Input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={e => setName(e.currentTarget.value)}
                    />
                    <Button type="submit" disabled={!name}>Join Game</Button>
                </form>
            )}
            {player && gameState === "waiting" && (
                <p className="text-lg">Waiting for the next step...</p>
            )}
            {player && gameState === "make_choice" && (
                <form onSubmit={submitChoice} className="space-y-4">
                    <h2 className="text-xl font-semibold">Enter your choice:</h2>
                    <Input
                        type="text"
                        placeholder="Your choice"
                        value={choice}
                        onChange={e => setChoice(e.currentTarget.value)}
                    />
                    <Button type="submit" disabled={!choice}>Submit Choice</Button>
                </form>
            )}
            {player && gameState === "make_bet" && (
                <form onSubmit={submitBet} className="space-y-4">
                    <h2 className="text-xl font-semibold">Enter your bet:</h2>
                    <Input
                        type="number"
                        placeholder="Your bet"
                        value={bet}
                        onChange={e => setBet(e.currentTarget.value)}
                    />
                    <Button type="submit" disabled={!bet}>Submit Bet</Button>
                </form>
            )}
        </div>
    )
}


