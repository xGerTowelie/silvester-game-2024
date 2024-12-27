import { Choice, Player } from "./Game"

export type PlayerLeftEvent = {
    name: string
}

export type PlayerJoinedEvent = {
    player: Player
}

export type PlayerChoiceEvent = {
    choice: Choice
}

