"use client"

import { GameState, Player } from "@/types/Game"
import { ReactNode } from "react"
import { Button } from "./ui/button"

type RoundDisplayProps = {
    gameState: GameState;
    nextStep: () => void;
    nextRound: () => void;
}

export default function RoundDisplay({ gameState, nextStep, nextRound }: RoundDisplayProps) {
    const { round, players } = gameState;

    const allChoicesMade = round.step === "choices" && players.every(player => player.choice);
    const remainingPlayers = players.filter(player => !player.choice);

    const renderContent = () => {
        switch (round.step) {
            case "question":
                return (
                    <>
                        <Question question={round.question} />
                        <NextButton next={nextStep}>Start Choices</NextButton>
                    </>
                )
            case "choices":
                return (
                    <>
                        <Question question={round.question} />
                        <p className="italic text-muted-foreground py-5">
                            Waiting for all choices ({players.filter(p => p.choice).length}/{players.length})
                        </p>
                        <NextButton next={nextStep} disabled={!allChoicesMade}>Show First Hint</NextButton>
                        {remainingPlayers.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold">Waiting for choices from:</h3>
                                <ul className="list-disc list-inside">
                                    {remainingPlayers.map(player => (
                                        <li key={player.name}>{player.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )
            case "hint1":
                return (
                    <>
                        <Question question={round.question} />
                        <Hint hint={round.hint1} />
                        <NextButton next={nextStep}>Start First Bet</NextButton>
                    </>
                )
            case "bet1":
                return (
                    <>
                        <Question question={round.question} />
                        <Hint hint={round.hint1} />
                        <p className="italic text-muted-foreground py-5">
                            Waiting for first bets ({players.filter(p => p.bet1).length}/{players.length})
                        </p>
                        <NextButton next={nextStep}>Show Second Hint</NextButton>
                    </>
                )
            case "hint2":
                return (
                    <>
                        <Question question={round.question} />
                        <Hint hint={round.hint1} />
                        <Hint hint={round.hint2} />
                        <NextButton next={nextStep}>Start Second Bet</NextButton>
                    </>
                )
            case "bet2":
                return (
                    <>
                        <Question question={round.question} />
                        <Hint hint={round.hint1} />
                        <Hint hint={round.hint2} />
                        <p className="italic text-muted-foreground py-5">
                            Waiting for second bets ({players.filter(p => p.bet2).length}/{players.length})
                        </p>
                        <NextButton next={nextStep}>Show Solution</NextButton>
                    </>
                )
            case "solution":
                return (
                    <>
                        <Question question={round.question} />
                        <Hint hint={round.hint1} />
                        <Hint hint={round.hint2} />
                        <p className="font-bold py-5">Solution: {round.solution}</p>
                        <NextButton next={nextRound}>New Round</NextButton>
                    </>
                )
            default:
                return <h1>Step not implemented...</h1>
        }
    }

    return (
        <RoundWrapper>
            {renderContent()}
        </RoundWrapper>
    )
}

function RoundWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="border border-primary p-5 space-y-5 rounded-lg">
            {children}
        </div>
    )
}

function Question({ question }: { question: string }) {
    return (
        <div>
            <h2 className="text-lg font-semibold">Question:</h2>
            <p>{question}</p>
        </div>
    )
}

type ButtonProps = {
    next: () => void
    children: string
    disabled?: boolean
}

function NextButton({ next, children, disabled = false }: ButtonProps) {
    return (
        <Button onClick={next} variant="default" disabled={disabled}>{children}</Button>
    )
}

function Hint({ hint }: { hint: string }) {
    return (
        <div>
            <h3 className="text-md font-semibold">Hint:</h3>
            <p>{hint}</p>
        </div>
    )
}


