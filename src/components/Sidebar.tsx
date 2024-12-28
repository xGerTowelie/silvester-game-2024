"use client"

import { Settings } from "lucide-react"
import { useState } from "react"
import Leaderboard from "./Leaderboard"
import { Player } from "@/types/Game"

type SidebarProps = {
    players: Player[]
}

export default function Sidebar({ players }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(true)

    const handleOnMouseLeave = () => { setCollapsed(true) }
    const handleOnMouseEnter = () => { setCollapsed(false) }

    return (
        <div
            onMouseLeave={handleOnMouseLeave}
            onMouseEnter={handleOnMouseEnter}
            className="flex flex-col p-3 items-center space-y-5 bg-white fixed right-0 border-2 rounded-l-xl">
            <Settings />
            <div className="flex flex-col">
                <pre>{JSON.stringify(players)}</pre>
                <Leaderboard players={players} collapsed={collapsed} />
            </div>
        </div>
    )

}

