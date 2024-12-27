"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

export default function PlayerPage() {
    const [player, setPlayer] = useState<string | null>(null)

    useEffect(() => {
        setPlayer(localStorage.getItem("playerName"))
    }, [])

    const register = (name: string) => {
        localStorage.setItem("playerName", name)
        setPlayer(name)
    }

    if (!player) {
        return (
            <PlayerRegistration onRegistration={register} />
        )
    }

    const socket = io("http://localhost:3001")

    socket.emit("player-join", player)

    return (
        <h1>Waiting to start...</h1>
    )

}

function PlayerRegistration({ onRegistration }: { onRegistration: (name: string) => void }) {
    const [name, setName] = useState("")

    return (
        <div className="flex flex-col space-y-4 p-5">
            <h1>Please enter your name to join:</h1>
            <Input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.currentTarget.value)} />
            <Button onClick={() => onRegistration(name)} disabled={!name}>Join Game</Button>
        </div>
    )

}
