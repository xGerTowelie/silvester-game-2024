import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { GameState, Player, Round } from './types/Game';
import { GameUpdateEvent, GetPlayerByNameEvent, GetPlayerByNameEventResponse, JoinEvent, PlayerChoiceEvent, PlayerBetEvent, PlayerJoinedEvent, PlayerLeftEvent } from './types/Events';

const PORT = process.env.PORT || 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const INITIAL_COINS = 500

const initialRound: Round = {
    step: "question",
    question: "How old was Albert Einstein when he received his first Nobel Prize?",
    hint1: "He was younger than Angela Merkel when she became German Chancellor",
    hint2: "He was older than 30.",
    solution: "42"
}

const Game: GameState = {
    round: initialRound,
    players: [],
    iteration: 0
}

const connections: Map<string, Socket> = new Map();

let monitor: Socket | null = null;

io.on("connection", (socket: Socket) => {
    connections.set(socket.id, socket);
    console.log(`New connection added to the pool: ${socket.id}`);

    // monitor calls
    socket.on("monitor", () => {
        monitor = socket;
        console.log("Monitor set/updated!");

        const event: GameUpdateEvent = {
            game: Game
        };

        monitor.emit("game_state_update", event);
        console.log("Game State sent to monitor.");
    });

    socket.on("request_choices", () => {
        Game.round.step = "choices";
        io.emit("make_choice");
        console.log("Requesting all players to make their choices!");
    });

    socket.on("request_bets", () => {
        Game.round.step = Game.round.step === "hint1" ? "bet1" : "bet2";
        io.emit("make_bet");
        console.log(`Requesting all players to make their ${Game.round.step} bets!`);
    });

    socket.on("next_step", () => {
        switch (Game.round.step) {
            case "question":
                Game.round.step = "choices";
                io.emit("make_choice");
                break;
            case "choices":
                Game.round.step = "hint1";
                break;
            case "hint1":
                Game.round.step = "bet1";
                io.emit("make_bet");
                break;
            case "bet1":
                Game.round.step = "hint2";
                break;
            case "hint2":
                Game.round.step = "bet2";
                io.emit("make_bet");
                break;
            case "bet2":
                Game.round.step = "solution";
                break;
            case "solution":
                Game.round = { ...initialRound };
                Game.iteration++;
                break;
        }
        io.emit("game_state_update", { game: Game });
    });

    // player calls
    socket.on("join", (event: JoinEvent, callback: (response: GetPlayerByNameEventResponse) => void) => {
        const newPlayer: Player = {
            socketId: socket.id,
            coins: INITIAL_COINS,
            name: event.name.charAt(0).toUpperCase() + event.name.substring(1),
            color: "red"
        };

        Game.players.push(newPlayer);

        if (monitor) {
            const event: PlayerJoinedEvent = { player: newPlayer };
            monitor.emit("player_joined", event);
        }

        console.log(`New player "${newPlayer.name}" joined the game!`);
        callback({ player: newPlayer });
        io.emit("game_state_update", { game: Game });
    });

    socket.on("get_player_by_name", (event: GetPlayerByNameEvent, callback: (response: GetPlayerByNameEventResponse) => void) => {
        if (event.name === "") {
            return callback({ player: null });
        }

        const player = Game.players.find(player => player.name === event.name);

        if (!player) {
            console.error(`User not found! ${event.name}`);
            return callback({ player: null });
        }

        console.log(`Player ${event.name} was found!`);
        callback({ player: player });
    });

    socket.on("choice", (event: PlayerChoiceEvent) => {
        const player = Game.players.find(p => p.name === event.choice.playerName);
        if (player) {
            player.choice = event.choice.value;
            console.log(`Player ${event.choice.playerName} submitted their choice: ${event.choice.value}`);
            io.emit("game_state_update", { game: Game });
        }
    });

    socket.on("bet", (event: PlayerBetEvent) => {
        const player = Game.players.find(p => p.name === event.bet.playerName);
        if (player) {
            if (Game.round.step === "bet1") {
                player.bet1 = event.bet.value;
            } else if (Game.round.step === "bet2") {
                player.bet2 = event.bet.value;
            }
            console.log(`Player ${event.bet.playerName} submitted their ${Game.round.step}: ${event.bet.value}`);
            io.emit("game_state_update", { game: Game });
        }
    });

    socket.on("disconnect", () => {
        connections.delete(socket.id);
        console.log(`Connection removed from the pool: ${socket.id}`);

        const player = Game.players.find(player => player.socketId === socket.id);
        if (player) {
            Game.players = Game.players.filter(p => p.socketId !== socket.id);
            if (monitor) {
                const event: PlayerLeftEvent = { name: player.name };
                monitor.emit("player_left", event);
            }
            console.log(`Player ${player.name} disconnected and left the game!`);
            io.emit("game_state_update", { game: Game });
        }

        if (monitor === socket) {
            monitor = null;
            console.log("Monitor disconnected!");
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


