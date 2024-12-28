/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Bet, Choice, GameState, Player } from "./types"

export type PlayerLeftEvent = {
    name: string
}

export type GetPlayerByNameEvent = {
    name: string
}

export type GetPlayerByNameEventResponse = {
    player: Player | null
}

export type MonitorSetEventResponse = {
    game: GameState
}

export type GameUpdateEvent = {
    game: GameState
}

export type JoinEvent = {
    name: string
    color: string
}

export type JoinEventResponse = {
    player: Player
}

export type PlayerJoinedEvent = {
    player: Player
}

export type PlayerChoiceEvent = {
    choice: Choice
}

export type PlayerBetEvent = {
    bet: Bet
}

export type RequestChoicesEvent = {
    // This event doesn't need any additional data
}

export type RequestBetsEvent = {
    round: "bet1" | "bet2"
}

export type NextStepEvent = {
    // This event doesn't need any additional data
}


