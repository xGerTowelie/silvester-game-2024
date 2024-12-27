import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { GameState } from './types/Game';
import { PlayerChoiceEvent, PlayerJoinedEvent, PlayerLeftEvent } from './types/Events';

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

const connections: Socket[] = []

let monitor: Socket

io.on("disconnect", (socket: Socket) => {
    const found = connections.findIndex(connection => connection.id === socket.id)

    if (found) {
        connections.slice(found)
    }
})

io.on("connection", (socket: Socket) => {
    const seen = connections.findIndex(connection => connection.id === socket.id)

    if (!seen) {
        connections.push(socket)
        console.log("New Connection added to the pool...")
    }

    // monitor calls
    socket.on("monitor", () => {
        if (!monitor) {
            monitor = socket
            console.log("Monitor set!")
        }
    })

    socket.on("request_choices", () => {
        Game.players.forEach(player => {
            const connection = getSocketById(player.socketId)

            if (!connection) {
                throw new Error(`No connection found for player ${player.name} with ${player.socketId}`)
            }

            connection.emit("make_choice")
            console.log(`Requesting player ${player.name} to make his choice!`)
        })
    })

    // player calls
    socket.on("join", (data: PlayerJoinedEvent) => {
        if (!monitor) {
            throw new Error("No monitor connected!")
        }

        const newPlayer = {
            ...data.player,
            socketId: socket.id,
            coins: INITIAL_COINS,
        }

        Game.players.push(newPlayer)

        monitor.emit("player_joined", { player: newPlayer } as PlayerJoinedEvent)
        console.log(`New player ${newPlayer.name} joined the game!`)
    })

    socket.on("leave", (event: PlayerLeftEvent) => {
        if (!monitor) {
            throw new Error("No monitor connected!")
        }

        monitor.emit("player_left", event as PlayerLeftEvent)
        console.log(`Player ${event.name} left the game!`)
    })

    socket.on("choice", (event: PlayerChoiceEvent) => {
        if (!monitor) {
            throw new Error("No monitor connected!")
        }

        monitor.emit("player_choice", event as PlayerChoiceEvent)
        console.log(`Player ${event.choice.playerName} submitted his choice!`)
    })

});

function getSocketById(id: string) {
    return connections.find(connection => connection.id === id)
}


httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
