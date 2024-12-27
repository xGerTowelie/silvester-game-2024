"use client"

type IterationCounterProps = {
    iteration: number
}

export default function IterationCounter({ iteration }: IterationCounterProps) {
    return (
        <h1>*Iteration: {iteration}</h1>
    )
}

