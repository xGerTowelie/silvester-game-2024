export type GameState = {
    iteration: number
    players: Array<Player>
    round: Round
}

export type Player = {
    socketId: string
    name: string
    color: string
    coins: number
    choice?: string
    bet1?: number
    bet2?: number
}

export type Round = {
    step: "question" | "choices" | "hint1" | "bet1" | "hint2" | "bet2" | "solution"
    question: string
    hint1: string
    hint2: string
    solution: string
}

export type Choice = {
    value: string
    playerName: string
}

export type Bet = {
    value: number
    playerName: string
}


