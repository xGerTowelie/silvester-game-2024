"use client"

import { Button } from "@/components/ui/button"
import clsx from "clsx"
import { useState } from "react"

type GAME_STATES = "LOBBY" | "QUESTION" | "HINT1" | "HINT2" | "SOLUTION"

type Round = {
    question: string
    hint1: string
    hint2: string
    solution: string
    source: string
}

const rounds: Round[] = [
    {
        question: "Wie gross ist die gesamte Flaeche der Bundesrepublik Deutschland in qm2?",
        hint1: "Frankreich hat eine Flaeche von 212qm2",
        hint2: "Deutschland ist kleiner als Frankreich",
        solution: "Deutschland ist 192qm2",
        source: "https://wikipedia.com/"
    }
    , {
        question: "Wie viele Einwohner hat Bayern?",
        hint1: "Baden Wuerttemberg hat 18 mio Einwohner",
        hint2: "Muenchen hat 1.2 mio Einwohner",
        solution: "Bayern hat 22 mio Einwohner",
        source: "https://wikipedia.com/"
    }
]

export default function MonitorPage() {


    const [state, setState] = useState<GAME_STATES>("QUESTION")
    const [round, setRound] = useState<Round>(rounds[0])

    switch (state) {
        case "LOBBY":
            return <Lobby />

        case "QUESTION":
            return (
                <div className="flex flex-col h-full items-center justify-center space-y-5">
                    <Question round={round} />
                    <div className="flex flex-row gap-5">
                        <Button
                            className="rounded text-xl bg-lime-400"
                            size="lg"
                            onClick={() => {
                                setState("HINT1")
                            }}>Accept</Button>
                        <Button className="rounded text-xl bg-red-400" size="lg"
                            onClick={() => {
                                setRound(rounds[1])
                            }}>Decline</Button>
                    </div>
                </div >
            )

        case "HINT1":
            return (
                <div className="flex flex-col h-full items-center justify-center space-y-5">
                    <Question round={round} />
                    <Hint1 round={round} />
                    <div className="flex flex-row gap-5">
                        <Button
                            className="rounded text-xl bg-lime-400"
                            size="lg"
                            onClick={() => {
                                setState("HINT2")
                            }}>Next Hint</Button>
                    </div>
                </div>
            )

        case "HINT2":
            return (
                <div className="flex flex-col h-full items-center justify-center space-y-5">
                    <Question round={round} />
                    <Hint1 round={round} />
                    <Hint2 round={round} />
                    <div className="flex flex-row gap-5">
                        <Button
                            className="rounded text-xl bg-lime-400"
                            size="lg"
                            onClick={() => {
                                setState("SOLUTION")
                            }}>Show Answer</Button>
                    </div>
                </div>
            )

        case "SOLUTION":
            return (
                <div className="flex flex-col h-full items-center justify-center space-y-5">
                    <Solution round={round} />
                    <div className="flex flex-row gap-5">
                        <Button
                            className="rounded text-xl bg-lime-400"
                            size="lg"
                            onClick={() => {
                                setRound(rounds[1])
                                setState("QUESTION")
                            }}>Next Question</Button>
                    </div>
                </div>
            )

        default:
            return <h1>Unknown game state: {state}</h1>
    }

}

function Solution({ round: { question } }: { round: Round }) {

    return (
        <ColoredCard title="Loesung:" description={question} color="white" />
    )
}

function Question({ round: { question } }: { round: Round }) {

    return (
        <ColoredCard title="Frage:" description={question} color="lime" />
    )
}

function Hint1({ round: { hint1 } }: { round: Round }) {

    return (
        <ColoredCard title="Hinweis 1:" description={hint1} color="teal" />
    )
}

function Hint2({ round: { hint2 } }: { round: Round }) {

    return (
        <ColoredCard title="Hinweis 2:" description={hint2} color="sky" />
    )
}

function ColoredCard({ title, description, color = "red" }: { title: string, description: string, color: string }) {
    const colorClasses: { [key: string]: string } = {
        teal: "border-teal-500/40 border-l-teal-500/80 bg-teal-900/20",
        white: "border-white/40 border-l-white/80 bg-white/20",
        sky: "border-sky-500/40 border-l-sky-500/80 bg-sky-900/20",
        lime: "border-lime-500/40 border-l-lime-500/80 bg-lime-900/20",
    };

    const classes = colorClasses[color] || colorClasses["red"];

    return (
        <div className={`px-12 py-8 w-full rounded-xl space-y-5 border-l-[5px] border ${classes}`}>
            <h1 className="text-4xl underline underline-offset-4">{title}</h1>
            <p className="text-2xl text-neutral-400">{description}</p>
        </div>
    );
}

function Lobby() {


    const players = ["player1", "player2", "player3", "player4", "player5", "player6"]

    return (
        <div className="flex flex-row space-x-32 h-full w-full">
            <div className="flex flex-col self-center items-center space-y-5">
                <div className="w-[300px] h-[300px] bg-red-300">QR</div>
                <h1 className="text-4xl">Scan to join!</h1>
                <h2 className="text-xl text-muted italic">(Waiting for the admin to start...)</h2>
            </div>
            <div className="p-5 space-y-3 w-full border-[1px] border-muted/60 rounded flex flex-col">
                {
                    players.map(player => (
                        <div key={player} className="text-xl">{"😎"} {player} joined the lobby </div>
                    ))
                }
            </div>
        </div>
    )
}
