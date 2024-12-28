import { Choice, Player } from "./Game"

export type PlayerLeftEvent = {
    name: string
}
export type GetPlayerByNameEvent = {
    name: string
}

export type GetPlayerByNameEventResponse = {
    player: Player | null
}

export type JoinEvent = {
    name: string
}

export type JoinEventReponse = {
    player: Player
}

export type PlayerJoinedEvent = {
    player: Player
}

export type PlayerChoiceEvent = {
    choice: Choice
}

