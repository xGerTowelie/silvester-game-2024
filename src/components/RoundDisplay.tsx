"use client"

import { GameState, Round } from "@/types/Game"
import { Dispatch, ReactNode, SetStateAction, useState } from "react"
import { Button } from "./ui/button"

type RoundDisplayProps = {
    newRound: Round
    requestChoices: () => void
    requestNewRound: () => void
    updateGameState: Dispatch<SetStateAction<GameState>>
}

export default function RoundDisplay({ newRound, requestNewRound, requestChoices }: RoundDisplayProps) {

    const [round, setRound] = useState(newRound)

    const prevStep = () => {
        switch (round.step) {
            case "question":
                requestNewRound()
                break

            case "choices":
                setRound((prev) => ({ ...prev, step: "question" }))
                break

            case "hint1":
                setRound((prev) => ({ ...prev, step: "choices" }))
                break

            case "bet1":
                setRound((prev) => ({ ...prev, step: "hint1" }))
                break

            case "hint2":
                setRound((prev) => ({ ...prev, step: "bet1" }))
                break

            case "solution":
                setRound((prev) => ({ ...prev, step: "hint2" }))
                break
        }

    }

    const nextStep = () => {
        switch (round.step) {
            case "question":
                requestChoices()
                setRound((prev) => ({ ...prev, step: "choices" }))
                break

            case "choices":
                setRound((prev) => ({ ...prev, step: "hint1" }))
                break

            case "hint1":
                setRound((prev) => ({ ...prev, step: "bet1" }))
                break

            case "bet1":
                setRound((prev) => ({ ...prev, step: "hint2" }))
                break

            case "hint2":
                setRound((prev) => ({ ...prev, step: "solution" }))
                break

            case "solution":
                requestNewRound()
                setRound((prev) => ({ ...prev, step: "question" }))
                break
        }

    }

    switch (round.step) {
        case "question":
            return (
                <RoundWrapper>
                    <Question question={round.question} />
                    <PrevButton prev={prevStep}>Skip Question</PrevButton>
                    <NextButton next={nextStep}>Make Choices</NextButton>
                </RoundWrapper>
            )

        case "choices":
            return (
                <RoundWrapper>
                    <Question question={round.question} />
                    <p className="italic muted py-5">Waiting for all choices (0/6)</p>
                    <PrevButton prev={prevStep}>Back to Question</PrevButton>
                    <NextButton next={nextStep}>Show first hint</NextButton>
                </RoundWrapper>
            )

        case "hint1":
            return (
                <RoundWrapper>
                    <Question question={round.question} />
                    <Hint hint={round.hint1} />
                    <PrevButton prev={prevStep}>Back to Choices</PrevButton>
                    <NextButton next={nextStep}>Start Bet</NextButton>
                </RoundWrapper>
            )

        case "bet1":
            return (
                <RoundWrapper>
                    <Question question={round.question} />
                    <Hint hint={round.hint1} />
                    <Hint hint={round.hint2} />
                    <p className="italic muted py-5">Lets bet!</p>
                    <PrevButton prev={prevStep}>Back to Hint1</PrevButton>
                    <NextButton next={nextStep}>Show second hint</NextButton>
                </RoundWrapper>
            )

        case "hint2":
            return (
                <RoundWrapper>
                    <Question question={round.question} />
                    <Hint hint={round.hint1} />
                    <Hint hint={round.hint2} />
                    <PrevButton prev={prevStep}>Back to Bet</PrevButton>
                    <NextButton next={nextStep}>Next Bet</NextButton>
                </RoundWrapper>
            )

        case "bet2":
            return (
                <RoundWrapper>
                    <Question question={round.question} />
                    <Hint hint={round.hint1} />
                    <Hint hint={round.hint2} />
                    <p className="italic muted py-5">Lets bet!</p>
                    <PrevButton prev={prevStep}>Back to Hint1</PrevButton>
                    <NextButton next={nextStep}>Show second hint</NextButton>
                </RoundWrapper>
            )

        default:
            return (
                <>

                    <h1>Step not implmeneted...</h1>
                </>
            )


    }
}

function RoundWrapper({ children }: { children: ReactNode }) {

    return (
        <div className="border border-red-300 p-5 space-y-5">
            {children}
        </div>
    )
}
function Question({ question }: { question: string }) {
    return (
        <div>
            <h1>Frage:</h1>
            <p>{question}</p>
        </div>
    )
}

type NextButtonProps = {
    next: () => void
    children: string
}
function NextButton({ next, children }: NextButtonProps) {
    return (
        <Button onClick={next} variant="default">{children}</Button>
    )
}

type PrevButtonProps = {
    prev: () => void
    children: string
}
function PrevButton({ prev, children }: PrevButtonProps) {
    return (
        <Button onClick={prev} variant="destructive">{children}</Button>
    )
}

function Hint({ hint }: { hint: string }) {
    return (
        <div>
            <h1>Hinweis:</h1>
            <p>{hint}</p>
        </div>
    )
}
