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
    const [collapsed, setCollapsed] = useState(false)

    const handleOnMouseLeave = () => { setCollapsed(true) }
    const handleOnMouseEnter = () => { setCollapsed(false) }

    return (
        <div
            onMouseLeave={handleOnMouseLeave}
            onMouseEnter={handleOnMouseEnter}
            className={`bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'
                } flex flex-col`}
        >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className={`font-semibold ${collapsed ? 'hidden' : 'block'}`}>Players</h2>
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
            </div>
            <div className="flex-grow overflow-auto">
                <Leaderboard players={players} collapsed={collapsed} />
            </div>
        </div>
    )
}


