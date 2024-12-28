"use client"

import { GameState } from "@/types/Game"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

type RoundDisplayProps = {
    gameState: GameState;
    nextStep: () => void;
    nextRound: () => void;
}

export default function RoundDisplay({ gameState, nextStep, nextRound }: RoundDisplayProps) {
    const { round, players, iteration } = gameState;
    const [displayedRound, setDisplayedRound] = useState(round);
    const [displayedHints, setDisplayedHints] = useState<string[]>([]);
    const [showSolution, setShowSolution] = useState(false);

    useEffect(() => {
        setDisplayedRound(round);
        setDisplayedHints([]);
        setShowSolution(false);
    }, [round, iteration]);

    const allChoicesMade = round.step === "choices" && players.every(player => player.choice);
    const allBetsMade = (round.step === "bet1" && players.every(player => player.bet1)) ||
        (round.step === "bet2" && players.every(player => player.bet2));
    const remainingPlayers = players.filter(player => !player.choice);

    const handleNextStep = () => {
        if (round.step === "question") {
            nextStep();
        } else if (round.step === "choices") {
            setDisplayedHints([round.hint1]);
            nextStep();
        } else if (round.step === "hint1") {
            nextStep();
        } else if (round.step === "bet1") {
            setDisplayedHints([round.hint1, round.hint2]);
            nextStep();
        } else if (round.step === "hint2") {
            nextStep();
        } else if (round.step === "bet2") {
            setShowSolution(true);
            nextStep();
        } else if (round.step === "solution") {
            nextRound();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Round {iteration + 1}: {round.step.charAt(0).toUpperCase() + round.step.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Question question={displayedRound.question} />
                {displayedHints.map((hint, index) => (
                    <Hint key={index} hint={hint} />
                ))}
                {showSolution && (
                    <Solution solution={displayedRound.solution} />
                )}
                {renderStepSpecificContent()}
                <NextButton
                    next={handleNextStep}
                    disabled={
                        (round.step === "choices" && !allChoicesMade) ||
                        ((round.step === "bet1" || round.step === "bet2") && !allBetsMade)
                    }
                >
                    {getNextButtonText()}
                </NextButton>
            </CardContent>
        </Card>
    );

    function renderStepSpecificContent() {
        switch (round.step) {
            case "choices":
                return (
                    <div>
                        <p className="text-sm text-gray-500">
                            Choices made: {players.filter(p => p.choice).length}/{players.length}
                        </p>
                        {remainingPlayers.length > 0 && (
                            <div className="mt-2">
                                <h3 className="text-sm font-semibold">Waiting for choices from:</h3>
                                <ul className="list-disc list-inside text-sm">
                                    {remainingPlayers.map(player => (
                                        <li key={player.name}>{player.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case "bet1":
            case "bet2":
                return (
                    <p className="text-sm text-gray-500">
                        Bets placed: {players.filter(p => p[round.step]).length}/{players.length}
                    </p>
                );
            default:
                return null;
        }
    }

    function getNextButtonText() {
        switch (round.step) {
            case "question": return "Start Choices";
            case "choices": return "Show First Hint";
            case "hint1": return "Start First Bet";
            case "bet1": return "Show Second Hint";
            case "hint2": return "Start Second Bet";
            case "bet2": return "Show Solution";
            case "solution": return "Next Round";
            default: return "Next Step";
        }
    }
}

function Question({ question }: { question: string }) {
    return (
        <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Question:</h2>
            <p>{question}</p>
        </div>
    );
}

function Hint({ hint }: { hint: string }) {
    return (
        <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold mb-2">Hint:</h3>
            <p>{hint}</p>
        </div>
    );
}

function Solution({ solution }: { solution: string }) {
    return (
        <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold mb-2">Solution:</h3>
            <p>{solution}</p>
        </div>
    );
}

type ButtonProps = {
    next: () => void;
    children: string;
    disabled?: boolean;
}

function NextButton({ next, children, disabled = false }: ButtonProps) {
    return (
        <Button onClick={next} variant="default" disabled={disabled} className="w-full">
            {children}
        </Button>
    );
}


