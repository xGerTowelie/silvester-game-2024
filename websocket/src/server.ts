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

    socket.on("monitor", () => {
        monitor = socket;
        console.log("Monitor set/updated!");
        const event: GameUpdateEvent = { game: Game };
        monitor.emit("game_state_update", event);
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
                break;
            case "bet1":
                Game.round.step = "hint2";
                break;
            case "hint2":
                Game.round.step = "bet2";
                break;
            case "bet2":
                Game.round.step = "solution";
                break;
            case "solution":
                Game.round = {
                    step: "question",
                    question: `New question for round ${Game.iteration + 1}`,
                    hint1: `Hint 1 for round ${Game.iteration + 1}`,
                    hint2: `Hint 2 for round ${Game.iteration + 1}`,
                    solution: `Solution for round ${Game.iteration + 1}`
                };
                Game.iteration++;
                Game.players.forEach(player => {
                    player.choice = undefined;
                });
                break;
        }
        io.emit("game_state_update", { game: Game });
    });

    socket.on("join", (event: JoinEvent, callback: (response: GetPlayerByNameEventResponse) => void) => {
        const newPlayer: Player = {
            socketId: socket.id,
            coins: INITIAL_COINS,
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
    });

    socket.on("get_player_by_name", (event: GetPlayerByNameEvent, callback: (response: GetPlayerByNameEventResponse) => void) => {
        const player = Game.players.find(player => player.name === event.name);
        callback({ player: player || null });
    });

    socket.on("choice", (event: PlayerChoiceEvent) => {
        const player = Game.players.find(p => p.name === event.choice.playerName);
        if (player) {
            player.choice = event.choice.value;
            console.log(`Player ${event.choice.playerName} submitted their choice: ${event.choice.value}`);
            io.emit("game_state_update", { game: Game });
        }
    });


    socket.on("kick_player", (playerName: string) => {
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


