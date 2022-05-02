var socket = io()
const gameTempalte = document.querySelector(".game-template")
const viewOfGames = document.querySelector(".view-of-games")

const width = window.innerWidth
const widthOfGameView = 350

function getData(){
    const username = document.getElementById("user").value
    const password = document.getElementById("pass").value

    fetch('/post/listaVCakalnici/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username:username,password:password})
      }).then(json=> json.json())
      .then(vCakalnici=>{
            let prev = document.createElement("div")
            prev.className="row-of-game-views"
            let i = 1
            let countView = 0
            const maxViewsInRow = Math.floor(width/widthOfGameView)
            vCakalnici.forEach(igra => {
                let div = loadOnScreen(igra)
                prev.appendChild(div)

                i += 1
                countView += 1

                if(i>=maxViewsInRow || countView >= vCakalnici.length){
                    viewOfGames.appendChild(prev)
                    prev = document.createElement("div")
                    prev.className="row-of-game-views"
                    i = 1
                }
            });
      })
}

getData()

function loadOnScreen(igra){
    let div = document.importNode(gameTempalte.content,true).querySelector("div")
    div.id = `game-view-${igra.id}`
    let buttons = div.querySelectorAll("button")
    addClassToButtons(buttons)
    loadOnMap(igra.map,buttons)

    let p = div.querySelector("p")
    let imeni = `${igra.player.ime} vs. ${igra.player2.ime}`
    if(igra.turn == "X"){
        imeni = `<b>${igra.player.ime}</b> vs. ${igra.player2.ime}`
    }else if(igra.turn == "O"){
        imeni = `${igra.player.ime} vs. <b>${igra.player2.ime}</b>`
    }
    p.innerHTML = imeni

    return div
}

function addClassToButtons(buttons){
    buttons.forEach(btn => {
        btn.disabled = true
    });
}

function loadOnMap(map,buttons){
    let n = 0
    for(let i=0;i<map.length;i++){
        let a = map[i]
        for(let j=0;j<a.length;j++){
            n += 1
            let b = map[i][j]
            buttons.forEach(btn => {
                if(btn.id == n){
                    btn.innerText = b
                }
            });
        }
    }
}

socket.on("getDataBack",igra=>{
    resetView()
})


function clearElement(element){
    element.childNodes.forEach(node=>{
        if(node.tagName == "DIV"){
            element.removeChild(node)
        }
    })
}

socket.on("osveziCakalnice",data=>{
    resetView()
})

function resetView(){
    clearElement(viewOfGames)
    getData()
}