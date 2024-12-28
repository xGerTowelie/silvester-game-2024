"use client"

type IterationCounterProps = {
    iteration: number
}

export default function IterationCounter({ iteration }: IterationCounterProps) {
    return (
        <h1 className="text-xl font-bold mb-4">Round: {iteration + 1}</h1>
    )
}


