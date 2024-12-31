"use client"

import { useState, useEffect } from 'react'
import { Sparkles, Clock } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

interface GameHeaderProps {
    iteration: number
}

export function GameHeader({ iteration }: GameHeaderProps) {
    const [timeUntilMidnight, setTimeUntilMidnight] = useState('')

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date()
            const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
            const diff = midnight.getTime() - now.getTime()

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeUntilMidnight(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        }

        updateTimer()
        const timerId = setInterval(updateTimer, 1000)

        return () => clearInterval(timerId)
    }, [])

    return (
        <Card className="bg-transparent border-none shadow-none">
            <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center">
                        <Sparkles className="h-8 w-8 text-yellow-400 mr-3" />
                        <h1 className="text-4xl font-bold text-white">Silvester Trivia</h1>
                        <div className="rounded-lg px-12 py-2 text-white">
                            <span className="text-xl uppercase tracking-wide">Round</span>
                            <span className="text-4xl font-bold ml-2">{iteration + 1}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center rounded-lg px-4 py-2 text-white">
                            <Clock className="h-5 w-5 mr-2 text-yellow-400" />
                            <div>
                                <span className="text-sm uppercase tracking-wide block">Countdown</span>
                                <span className="text-2xl font-mono">{timeUntilMidnight}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

