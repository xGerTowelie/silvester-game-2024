import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { GameState, Player } from './types/Game';
import { GameUpdateEvent, GetPlayerByNameEvent, GetPlayerByNameEventResponse, JoinEvent, PlayerChoiceEvent, PlayerJoinedEvent, PlayerLeftEvent } from './types/Events';

const PORT = process.env.PORT || 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const INITIAL_COINS = 500

const Game: GameState = {
    round: {
        step: "question",
        question: "How old was Albert Einstein when he received his first nobel price?",
        hint1: "He was younger than Angela Merkel when she became German Kanzler",
        hint2: "He was older than 30.",
        solution: "42"
    },
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
        Game.players.forEach(player => {
            const connection = connections.get(player.socketId);

            if (!connection) {
                console.error(`No connection found for player ${player.name} with ${player.socketId}`);
                return;
            }

            connection.emit("make_choice");
            console.log(`Requesting player ${player.name} to make their choice!`);
        });
    });

    // player calls
    socket.on("join", (event: JoinEvent) => {
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
    });

    socket.on("get_player_by_name", (event: GetPlayerByNameEvent, response: (e: GetPlayerByNameEventResponse) => void) => {
        if (event.name === "") {
            return response({ player: null });
        }

        const player = Game.players.find(player => player.name === event.name);

        if (!player) {
            console.error(`User not found! ${event.name}`);
            return response({ player: null });
        }

        console.log(`Player ${event.name} was found!`);
        response({ player: player });
    });

    socket.on("leave", (event: PlayerLeftEvent) => {
        if (!monitor) {
            console.error("No monitor connected!");
            return;
        }

        const playerIndex = Game.players.findIndex(player => player.name === event.name);
        if (playerIndex !== -1) {
            Game.players.splice(playerIndex, 1);
            monitor.emit("player_left", event);
            console.log(`Player ${event.name} left the game!`);
        } else {
            console.error(`Player ${event.name} not found in the game!`);
        }
    });

    socket.on("choice", (event: PlayerChoiceEvent) => {
        if (!monitor) {
            console.error("No monitor connected!");
            return;
        }

        monitor.emit("player_choice", event);
        console.log(`Player ${event.choice.playerName} submitted their choice!`);
    });

    socket.on("disconnect", () => {
        connections.delete(socket.id);
        console.log(`Connection removed from the pool: ${socket.id}`);

        const player = Game.players.find(player => player.socketId === socket.id);
        if (player && monitor) {
            const event: PlayerLeftEvent = { name: player.name };
            monitor.emit("player_left", event);
            console.log(`Player ${player.name} disconnected and left the game!`);
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


