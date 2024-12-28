"use client"

import DebugState from "@/components/DebugState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GetPlayerByNameEvent, GetPlayerByNameEventResponse, JoinEvent, JoinEventReponse } from "@/types/Events"
import { Player } from "@/types/Game"
import { RotateCwIcon } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

export default function PlayerPage() {
    const [name, setName] = useState("")
    const [player, setPlayer] = useState<Player | null>(null)
    const [socket, setSocket] = useState<Socket | undefined>(undefined)

    const resetCache = () => {
        localStorage.clear()
    }

    const join = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!socket) {
            throw new Error("No socket set.")
        }

        const event: JoinEvent = { name: name }

        socket.emit("join", event, (response: JoinEventReponse) => {
            console.log(`Join result: ${response}`)
            setPlayer(response.player)
        })
    }

    // connect and disconnect on unmount
    useEffect(() => {
        const newSocket = io("http://localhost:3001")
        console.log("Socket connection established.")
        setSocket(newSocket)

        const cachePlayer: GetPlayerByNameEvent = { name: localStorage.getItem("player") as string }

        if (cachePlayer.name) {
            newSocket.emit("get_player_by_name", cachePlayer as GetPlayerByNameEvent, (response: GetPlayerByNameEventResponse) => {
                console.log(`Player lookup result: ${response}`)

                if (response.player) {
                    setPlayer(response.player)
                }

                throw new Error(`Player lookup failed for: ${cachePlayer}`)
            })
        }

        return () => {
            newSocket.disconnect()
            console.log("Socket connection disconnected.")
        }
    }, [])

    if (!socket) {
        return (
            <h1>Currently no game running...</h1>
        )
    }

    return (
        <form onSubmit={join} className="flex flex-col space-y-4 p-5">
            <DebugState state={socket} title="current socket" />
            {player && <Button onClick={resetCache}><RotateCwIcon />Reset Cache</Button>}
            {!player &&
                <>
                    <h1>Please enter your name to join:</h1>
                    <Input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.currentTarget.value)} />
                    <Button disabled={!name}>Join Game</Button>
                </>
            }
        </form>

    )
}
