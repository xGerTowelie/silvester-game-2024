"use client"

import { Player } from "@/types/Game"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { CustomAvatar } from "./CustomAvatar"

type LeaderboardProps = {
    collapsed: boolean,
    players: Player[]
}

export default function Leaderboard({ collapsed, players }: LeaderboardProps) {
    const sortedPlayers = [...players].sort((a, b) => b.coins - a.coins);

    return (
        <div className="space-y-4 p-4">
            {sortedPlayers.map((player, index) => (
                <motion.div
                    key={player.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                >
                    <CustomAvatar
                        name={player.name}
                        color={player.color}
                        size={34}
                        animation="electricSurge"
                    />
                    {!collapsed && (
                        <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{player.name}</span>
                                <span className="text-sm text-gray-500">{player.coins} coins</span>
                            </div>
                            <div className="mt-1">
                                <Progress value={(player.coins / 1000) * 100} className="h-2" />
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                {getPlayerStatus(player)}
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    )
}

function getPlayerStatus(player: Player): string {
    if (player.choice) return "Choice made";
    if (player.bet2) return "Second bet placed";
    if (player.bet1) return "First bet placed";
    return "Waiting for action";
}


