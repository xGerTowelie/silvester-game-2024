"use client"

import { useState } from "react"
import { Settings } from 'lucide-react'
import Leaderboard from "./Leaderboard"
import { Player } from "@/types/Game"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"

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
            className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col p-3 items-center space-y-5 bg-white border-l-2 min-h-[200px] max-h-[80vh] overflow-auto shadow-lg"
        >
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col space-y-4">
                        <Button onClick={() => console.log("Refresh cache")}>
                            Refresh Cache
                        </Button>
                        <Button onClick={() => console.log("Kick players")}>
                            Kick Players
                        </Button>
                        <Button onClick={() => console.log("Reset game")}>
                            Reset Game
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="flex flex-col">
                <Leaderboard players={players} collapsed={collapsed} />
            </div>
        </div>
    )
}


