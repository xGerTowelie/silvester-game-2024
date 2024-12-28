"use client"

import { Player } from "@/app/(app)/monitor-new/page"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"


type LeaderboardProps = {
    collapsed: boolean,
    players: Player[]
}

export default function Leaderboard({ collapsed, players }: LeaderboardProps) {

    return (
        <div className="space-y-4">
            {players && players.map((player, index) => (
                <motion.div
                    key={player.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                >
                    <Avatar className="w-10 h-10">
                        <AvatarFallback>{`${player.name.charAt(0)}${player.name.charAt(1)}`}</AvatarFallback>
                    </Avatar>
                    {
                        !collapsed && (
                            <div className="flex flex-col flex-1">
                                <div className="flex flex-row items-center space-x-2">
                                    <span className="flex-grow text-sm font-medium leading-none">{player.name}</span>
                                    <span className="text-sm font-medium">{`(1337)`}</span>
                                </div>
                                <div className="flex-1">
                                    <Progress
                                        value={100}
                                        className="h-2 mt-2"
                                    />
                                </div>
                            </div>
                        )
                    }
                </motion.div>
            ))}
        </div>
    )
}


