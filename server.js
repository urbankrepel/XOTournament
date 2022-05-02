//express
const express = require("express")
const app = express()

//http
const http = require("http").createServer(app)

// socket
const io = require("socket.io")(http)

//dotenv
require("dotenv").config()

//basic-auth
const basicAuth = require("basic-auth")

//constants
const port = 8080

let igralci = []

let currentRound = 0
let vCakalnici = []

//Functions

let isValid = (req, res, next) => {
    if (req.body !== null || req.body !== undefined || req.body !== []) {
        next()
    } else {
        res.sendStatus(404)
    }
}

let adminValidation = (req, res, next) => {
    let user = basicAuth(req)

    if (user === undefined || user["name"] !== process.env.USERNAME || user["pass"] !== process.env.PASSWORD) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="Da bos lahko vodil"')
        res.end('Unauthorized')
    } else {
        next()
    }
}

let adminAuth = (req, res, next) => {
    if (req.body === null || req.body === undefined || req.body === []) {
        res.sendStatus(401)
        return
    }
    if (req.body.username === process.env.USERNAME && req.body.password === process.env.PASSWORD) {
        next()
    } else {
        res.sendStatus(401)
    }

}

function generateUUID() {
    var d = new Date().getTime();

    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
}

function getDataForPlayer(apiKey) {
    return igralci.find(e => e.api == apiKey)
}

function razporediVEkipe() {
    let novaIgra = null
    let id = 1
    for (let i = 0; i < igralci.length; i++) {
        let player = igralci[i]
        if (!pregledjČeJeVEkipi(player) && player.inGame) {
            if (novaIgra == null) {
                novaIgra = new Igra(player, null, 0, id)
            } else {
                novaIgra.player2 = player
                vCakalnici.push(novaIgra)
                novaIgra = null
                id += 1
            }
        }
    }
}

function pregledjČeJeVEkipi(player) {
    for (let i = 0; i < vCakalnici.length; i++) {
        let igra = vCakalnici[i]
        if (igra.player == player || igra.player2 == player) {
            return true
        }
    }
    return false
}


function removeFromArray(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
}

function getDataIzCakalnice(apiKey) {
    for (let i = 0; i < vCakalnici.length; i++) {
        let igra = vCakalnici[i]
        if (igra.player.api == apiKey || igra.player2.api == apiKey) {
            return igra
        }
    }
    return undefined
}

function updateMap(map, id, str) {
    let n = 0
    for (let i = 0; i < map.length; i++) {
        let a = map[i]
        for (let j = 0; j < a.length; j++) {
            n += 1
            if (n == id) {
                if (map[i][j] !== "X" && map[i][j] !== "O") {
                    map[i][j] = str
                } else {
                    return undefined
                }
            }
        }
    }
    return map
}

function chechWin(map) {
    for (let i = 0; i < 3; i++) {
        if (three(map[i][0], map[i][1], map[i][2])) {
            return map[i][0]
        }
    }
    for (let i = 0; i < 3; i++) {
        if (three(map[0][i], map[1][i], map[2][i])) {
            return map[0][i]
        }
    }
    if (three(map[0][0], map[1][1], map[2][2])) {
        return map[0][0]
    }
    if (three(map[0][2], map[1][1], map[2][0])) {
        return map[0][2]
    }
    if (isDraw(map)) {
        return "draw"
    }
    return ""
}

function zakljuciIgro(winPlayerApi, loserPlayerApi, igra) {
    let winPlayer = getDataForPlayer(winPlayerApi)
    let loserPlayer = getDataForPlayer(loserPlayerApi)

    //Player that win
    winPlayer.round = currentRound
    winPlayer.score += 1

    //Player that lose
    loserPlayer.round = currentRound
    loserPlayer.inGame = false

    removeFromArray(vCakalnici, igra)
    io.emit("refreshGameStatus",{apiKey:winPlayer.api})
    io.emit("refreshGameStatus",{apiKey:loserPlayer.api})
}

function isDraw(map) {
    let n = 0
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (map[y][x] === "X" || map[y][x] === "O") {
                n += 1
            }
        }
    }
    return n === 9
}

function isTurnamentEnd() {
    let steviloIgralecvVIgri = igralci.filter(igralec => igralec.inGame === true).length
    if (steviloIgralecvVIgri < 2 && currentRound > 0){
        return true
    }else{
        return false
    }
}

function three(a, b, c) {
    return a === b && b === c && c === a && a !== "" && b !== "" && c !== ""
}

function checkIfIsEnoughPlayers(){
    let i = 1
    let steviloIgralcev = igralci.length
    if(steviloIgralcev < 2){
        return (2-steviloIgralcev)
    }
    while(steviloIgralcev != 2**i){
        if(2**i > steviloIgralcev){
            return ((2**i)-steviloIgralcev)
        }

        i += 1
    }
    return 0
}

app.use(express.json())
app.use("/javno/", express.static(__dirname + "/website/public/"))
app.use("/favicon.ico", express.static(__dirname + "/website/icon.ico"))

//sites
app.get("/", (req, res) => {
    res.redirect("/home/")
})

app.get("/home/", (req, res) => {
    res.sendFile(__dirname + "/website/home/index.html")
})

app.get("/cakalnica/", (req, res) => {
    res.sendFile(__dirname + "/website/cakalnica/index.html")
})

app.get("/prijavaTekmovalcev/", (req, res) => {
    res.sendFile(__dirname + "/website/prijavaIgralcev/index.html")
})

app.get("/igralnaPlosca/", (req, res) => {
    res.sendFile(__dirname + "/website/igralnaPlosca/index.html")
})

app.get("/vodilni/", adminValidation, (req, res) => {
    res.sendFile(__dirname + "/website/vodilni/index.html")
})

app.get("/konec/", (req, res) => {
    res.sendFile(__dirname + "/website/konec/index.html")
})

app.get("/ogledTrenutnihIger/",adminValidation,(req,res)=>{
    res.sendFile(__dirname+"/website/ogledTrenutnihIger/index.html")
})

//post
app.post("/post/vpisIgralca/", isValid, (req, res) => {
    let ime = req.body.ime
    let api = generateUUID()

    let novIgralec = new Igrlec(api, ime)
    igralci.push(novIgralec)

    res.json({ apiKey: novIgralec.api })
})

app.post("/post/getData/", isValid, (req, res) => {
    let apiKey = req.body.apiKey

    let p = getDataForPlayer(apiKey)
    if (p === undefined) {
        res.sendStatus(403)
    } else {
        res.json(p)
    }
})

app.post("/post/listaIgralcev/", adminAuth, (req, res) => {
    res.json(igralci)
})
app.post("/post/leave/", isValid, (req, res) => {
    let igralec = getDataForPlayer(req.body.apiKey)
    if (igralec !== undefined) {
        removeFromArray(igralci, igralec)
        res.sendStatus(200)
    } else {
        res.sendStatus(401)
    }
})

app.post("/post/razporediVEkipe/", adminAuth, (req, res) => {
    if(vCakalnici.length > 0){
        res.json({error:`Ekipe so že narejene!`})
        return
    }
    let playerCheck = checkIfIsEnoughPlayers()
    if(playerCheck !== 0){
        res.json({error:`Ni dovolj igralcev. Manjka jih ${playerCheck}!`})
        return
    }

    if(!isTurnamentEnd()){
        razporediVEkipe()
        currentRound += 1
    }
    io.emit("osveziCakalnice",{})
    res.json(vCakalnici)
})
app.post("/post/listaVCakalnici/", adminAuth, (req, res) => {
    res.json(vCakalnici)
})
app.post("/post/start/", adminAuth, (req, res) => {
    let playerCheck = checkIfIsEnoughPlayers()
    if(playerCheck !== 0){
        res.json({error:`Ni dovolj igralcev. Manjka jih ${playerCheck}!`})
        return
    }
    if(vCakalnici.length < 1){
        res.json({error:`Najprej dajte igralce v ekipe!`})
        return
    }
    for (let i = 0; i < vCakalnici.length; i++) {
        let igra = vCakalnici[i]
        igra.started = true
        io.emit("gameHasStarted",{apiKey:igra.player.api})
        io.emit("gameHasStarted",{apiKey:igra.player2.api})
    }
    res.sendStatus(200)
})
app.post("/post/igraInfo/", isValid, (req, res) => {
    let apiKey = req.body.apiKey
    let igra = getDataIzCakalnice(apiKey)
    if (igra !== undefined) {
        res.json(igra)
    } else {
        res.sendStatus(403)
    }
})
app.post("/post/kateroMesto/",isValid,(req,res)=>{
    let apiKey = req.body.apiKey
    let igralec = getDataForPlayer(apiKey)
    if(igralec !== undefined){
        let sortPlayers = igralci.sort((a,b)=>{
            if(a.inGame && !b.inGame) return -1
            if(!a.inGame && b.inGame) return 1


            if(a.score > b.score) return -1
            if(a.score < b.score) return 1

            return 0
        })
        let mesto = sortPlayers.indexOf(igralec) + 1
        return res.json({mesto:mesto})
    }else{
        res.sendStatus(401)
    }
    
})
app.post("/post/isGameOver/",isValid,(req,res)=>{
    let apiKey = req.body.apiKey
    let igralec = getDataForPlayer(apiKey)
    if(igralec !== undefined){
        let konec = isTurnamentEnd()
        res.json({konec:konec})
    }else{
        res.sendStatus(401)
    }
})
app.post("/post/resetCakalnici/",adminAuth,(req,res)=>{
    vCakalnici = []
    currentRound -= 1
    io.emit("osveziCakalnice",{})
    res.sendStatus(200)
})
//get

app.get("/get/playerCheck/",(req,res)=>{
    res.json({playerCheck:checkIfIsEnoughPlayers()})
})

//io
io.on("connection", socket => {
    socket.on("getData", data => {
        let igra = getDataIzCakalnice(data.apiKey)
        if (igra !== undefined) {
            socket.emit("getDataBack", igra)
        }
    })
    socket.on("updateMap", data => {
        let apiKey = data.apiKey
        let id = data.id
        let igra = getDataIzCakalnice(apiKey)
        if (igra !== undefined) {
            let preveriCeJeNjegovTurnX = igra.turn === "X" && igra.player.api === apiKey
            let preveriCeJeNjegovTurnO = igra.turn === "O" && igra.player2.api === apiKey
            let preveriCeJeNjegovTurn = preveriCeJeNjegovTurnX || preveriCeJeNjegovTurnO
            if (preveriCeJeNjegovTurn) {
                let returnMap = updateMap(igra.map, id, igra.turn)
                if (returnMap !== undefined) {
                    igra.map = returnMap
                    let win = chechWin(returnMap)
                    if (win === "X") {
                        igra.turn = ""
                        zakljuciIgro(igra.player.api, igra.player2.api, igra)
                    } else if (win === "O") {
                        igra.turn = ""
                        zakljuciIgro(igra.player2.api, igra.player.api, igra)
                    } else if (win === "draw") {
                        igra.map = [
                            ["", "", ""],
                            ["", "", ""],
                            ["", "", ""]
                        ]
                        igra.turn = igra.turn === "O" ? "X" : "O"
                    } else if (win === "") {
                        igra.turn = igra.turn === "O" ? "X" : "O"
                    }
                    io.emit("getDataBack", igra)
                }
            }
        }
    })
    socket.on("sendEmoji",data=>{
        let apiKey = data.apiKey
        let igra = getDataIzCakalnice(apiKey)
        let sendApi = undefined
        if(igra === undefined){
            return
        }
        if(igra.player.api === apiKey){
            sendApi = igra.player2.api
        }else if(igra.player2.api === apiKey){
            sendApi = igra.player.api
        }
        let text = data.text
        if(sendApi !== undefined){
            io.emit("getEmoji",{text:text,apiKey:sendApi})
        }
    })
})

//Listening
http.listen(port, () => {
    console.log(`Listening on *:${port}`)
})


//Class

class Igrlec {
    constructor(api, ime) {
        this.api = api
        this.ime = ime
        this.round = 0
        this.inGame = true
        this.score = 0
    }
}

class Igra {
    constructor(player, player2, round, id) {
        this.player = player
        this.player2 = player2
        this.map = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""]
        ]
        this.round = round
        this.id = id
        this.started = false
        this.turn = "X"
    }
}