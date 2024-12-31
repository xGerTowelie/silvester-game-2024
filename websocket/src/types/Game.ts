export type Player = {
    id: string;
    name: string;
    color: string;
    choice?: string;
    socketId: string;
    lastActive: number;
}

export type Round = {
    step: "question" | "choices" | "hint1" | "hint2" | "solution";
    number: number;
    question: string;
    question_english: string;
    hint1: string;
    hint2: string;
    solution: string;
    source: string;
    confidence: {
        claude: number;
        gpt: number;
    };
}

export type GameState = {
    iteration: number;
    players: Array<Player>;
    round: Round | null;
}

export interface Question {
    id: number;
    question: string;
    question_english: string;
    answer: string;
    source: string;
    hint1: string;
    hint2: string;
    confidence: {
        claude: number;
        gpt: number;
    };
}

export type Choice = {
    value: string
    playerName: string
}

