import { Choice, GameState, Player } from "./Game"

export type PlayerLeftEvent = {
    name: string;
}

export type GetPlayerByNameEvent = {
    name: string;
}

export type GetPlayerByNameEventResponse = {
    player: Player | null;
}

export type MonitorSetEventResponse = {
    game: GameState;
}

export type GameUpdateEvent = {
    game: GameState;
}

export type JoinEvent = {
    name: string;
    color: string;
}

export type JoinEventResponse = {
    player: Player;
}

export type PlayerJoinedEvent = {
    player: Player;
}

export type PlayerChoiceEvent = {
    choice: Choice;
}

