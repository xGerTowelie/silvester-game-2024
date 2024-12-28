import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { GameState, Player } from './types/Game';
import { GetPlayerByNameEvent, GetPlayerByNameEventResponse, JoinEvent, PlayerChoiceEvent, PlayerJoinedEvent, PlayerLeftEvent } from './types/Events';

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
        monitor = socket
        console.log("Monitor set/updated!")
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
    socket.on("join", (event: JoinEvent) => {
        const newPlayer: Player = {
            socketId: socket.id,
            coins: INITIAL_COINS,
            name: event.name.charAt(0).toUpperCase() + event.name.substring(1),
            color: "red"
        }

        Game.players.push(newPlayer)

        if (monitor) {
            const event: PlayerJoinedEvent = { player: newPlayer }
            monitor.emit("player_joined", event)
        }

        console.log(`New player "${newPlayer.name}" joined the game!`)
    })

    socket.on("get_player_by_name", (event: GetPlayerByNameEvent, response: (e: GetPlayerByNameEventResponse) => void) => {

        if (event.name == "") {
            return response({ player: null })
        }

        const player = Game.players.find(player => player.name === event.name)

        if (!player) {
            throw new Error(`User not found! ${event.name}`)
        }

        console.log(`Player ${event.name} was found!`)
        response({ player: player })
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
