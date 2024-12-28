import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { GameState, Player, Round } from './types/Game';
import {
    GameUpdateEvent,
    GetPlayerByNameEvent,
    GetPlayerByNameEventResponse,
    JoinEvent,
    PlayerChoiceEvent,
    PlayerJoinedEvent,
    PlayerLeftEvent
} from './types/Events';

const PORT = process.env.PORT || 3001;

// Create HTTP server
const httpServer = createServer();

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
    // Add reconnection configurations
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    },
});

const initialRound: Round = {
    step: "question",
    number: 1,
    question: "How old was Albert Einstein when he received his first Nobel Prize?",
    hint1: "He was younger than Angela Merkel when she became German Chancellor",
    hint2: "He was older than 30.",
    solution: "42"
};

const Game: GameState = {
    round: initialRound,
    players: [],
    iteration: 0
};

// Store active connections
const connections: Map<string, Socket> = new Map();
let monitor: Socket | null = null;

// Error handling middleware
io.use((socket, next) => {
    try {
        // Add any authentication or validation here
        next();
    } catch (error) {
        console.log(error)
        next(new Error("Authentication error"));
    }
});

io.on("connection", (socket: Socket) => {
    connections.set(socket.id, socket);
    console.log(`New connection added to the pool: ${socket.id}`);

    // Handle errors for this socket
    socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });

    socket.on("monitor", () => {
        monitor = socket;
        console.log("Monitor set/updated!");
        const event: GameUpdateEvent = { game: Game };
        monitor.emit("game_state_update", event);
    });

    socket.on("next_step", () => {
        try {
            switch (Game.round.step) {
                case "question":
                    Game.round.step = "choices";
                    io.emit("make_choice");
                    break;
                case "choices":
                    Game.round.step = "hint1";
                    break;
                case "hint1":
                    Game.round.step = "hint2";
                    break;
                case "hint2":
                    Game.round.step = "solution";
                    break;
                case "solution":
                    Game.round = {
                        step: "question",
                        number: Game.round.number + 1,
                        question: `New question for round ${Game.iteration + 2}`,
                        hint1: `Hint 1 for round ${Game.iteration + 2}`,
                        hint2: `Hint 2 for round ${Game.iteration + 2}`,
                        solution: `Solution for round ${Game.iteration + 2}`
                    };
                    Game.iteration++;
                    Game.players.forEach(player => {
                        player.choice = undefined;
                    });
                    break;
            }
            io.emit("game_state_update", { game: Game });
        } catch (error) {
            console.error("Error in next_step:", error);
            socket.emit("error", { message: "Failed to process next step" });
        }
    });

    socket.on("join", (event: JoinEvent, callback: (response: GetPlayerByNameEventResponse) => void) => {
        try {
            // Validate player name
            if (!event.name || !event.color) {
                throw new Error("Invalid player data");
            }

            const existingPlayer = Game.players.find(p => p.name.toLowerCase() === event.name.toLowerCase());
            if (existingPlayer) {
                throw new Error("Player name already taken");
            }

            const newPlayer: Player = {
                id: socket.id,
                socketId: socket.id,
                name: event.name.charAt(0).toUpperCase() + event.name.substring(1),
                color: event.color
            };

            Game.players.push(newPlayer);

            if (monitor) {
                const event: PlayerJoinedEvent = { player: newPlayer };
                monitor.emit("player_joined", event);
            }

            console.log(`New player "${newPlayer.name}" joined the game!`);
            callback({ player: newPlayer });
            io.emit("game_state_update", { game: Game });
        } catch (error) {
            console.error("Error in join:", error);
            callback({ player: null });
        }
    });

    socket.on("get_player_by_name", (event: GetPlayerByNameEvent, callback: (response: GetPlayerByNameEventResponse) => void) => {
        try {
            const player = Game.players.find(player => player.name === event.name);
            callback({ player: player || null });
        } catch (error) {
            console.error("Error in get_player_by_name:", error);
            callback({ player: null });
        }
    });

    socket.on("choice", (event: PlayerChoiceEvent) => {
        try {
            const player = Game.players.find(p => p.name === event.choice.playerName);
            if (player) {
                player.choice = event.choice.value;
                console.log(`Player ${event.choice.playerName} submitted their choice: ${event.choice.value}`);
                io.emit("game_state_update", { game: Game });
            }
        } catch (error) {
            console.error("Error in choice:", error);
            socket.emit("error", { message: "Failed to submit choice" });
        }
    });

    socket.on("kick_player", (playerName: string) => {
        try {
            const playerIndex = Game.players.findIndex(p => p.name === playerName);
            if (playerIndex !== -1) {
                const player = Game.players[playerIndex];
                Game.players.splice(playerIndex, 1);
                const playerSocket = connections.get(player.socketId);
                if (playerSocket) {
                    playerSocket.disconnect();
                }
                console.log(`Player ${playerName} has been kicked from the game.`);
                io.emit("game_state_update", { game: Game });
            }
        } catch (error) {
            console.error("Error in kick_player:", error);
            socket.emit("error", { message: "Failed to kick player" });
        }
    });

    socket.on("disconnect", () => {
        try {
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
        } catch (error) {
            console.error("Error in disconnect:", error);
        }
    });
});

// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


