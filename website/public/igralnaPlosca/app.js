var socket = io()
const apiKey = sessionStorage.getItem("apiKey")
const prikazZaIgro = document.querySelector(".prikaz-za-igro")
const buttons = document.querySelector(".vStack")
const turnText = document.querySelector(".turn-text")
const emojiSelection = document.querySelector(".emoji-selection")
const displayEmoji = document.querySelector(".display-emoji")

function onLoad(){
    jePrijavljen()
    socket.emit("getData",{apiKey:apiKey})
}

function jePrijavljen(){
    fetch('/post/getData/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({apiKey:apiKey})
      }).then(json=>{
          if(json.ok){
            return json.json()
          }
        })
      .then(data=>{
        if(data === undefined || data === null){
          window.location.pathname="/prijavaTekmovalcev/"
          return
        }else if(!data.inGame){
            window.location.pathname="/konec/"
            return
        }
      })
      fetch('/post/igraInfo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({apiKey:apiKey})
      }).then(json=> {
          if(json.ok){
            return json.json()
          }
      })
      .then(data=>{
        if(data === null || data === undefined || data === []){
            window.location.pathname="/cakalnica/"
            return
        }
      })
}

setInterval(jePrijavljen,5000)

socket.on("getDataBack",data=>{
  if(data.player.api !== apiKey && data.player2.api !== apiKey){
    return
  }
    let otherName = apiKey == data.player.api ? data.player2.ime : data.player.ime
    prikazZaIgro.innerText = `Ti vs. ${otherName}`
    loadOnMap(data.map)
    let siTiIgralec1 = data.player.api === apiKey
    let siTiIgralec2 = data.player2.api === apiKey
    let turnTextDis = "Tvoja"
    if(data.turn === ""){
        turnTextDis = "Nobody"
    }
    else if(data.turn === "X" && siTiIgralec1){
        turnTextDis = "Tvoja"
    }else if (data.turn === "O" && siTiIgralec2){
        turnTextDis = "Tvoja"
    }else{
        turnTextDis = siTiIgralec1 ? `${data.player2.ime}` : `${data.player.ime}`
    }
    addClassToButtons(turnTextDis == "Tvoja" ? true : false)
    turnText.innerText = `Poteza: ${turnTextDis}`
})

socket.on("getEmoji",data=>{
  let api = data.apiKey
  if(api !== apiKey){
    return
  }
  let text = data.text
  displayEmoji.innerText = `${text}`
  setTimeout(()=>{
    displayEmoji.innerText = ""
  },5000)
})

socket.on("refreshGameStatus",data=>{
    if(data.apiKey === apiKey){
        jePrijavljen()
    }
})

onLoad()

function loadOnMap(map){
    let n = 0
    for(let i=0;i<map.length;i++){
        let a = map[i]
        for(let j=0;j<a.length;j++){
            n += 1
            let b = map[i][j]
            document.getElementById(`${n}`).innerText = b
        }
    }
}

buttons.addEventListener("click",e=>{
    const target = e.target
    if(target.tagName === "BUTTON"){
        let id = target.id
        socket.emit("updateMap",{id:id,apiKey:apiKey})
    }
})

emojiSelection.addEventListener("click",e=>{
    let target = e.target
    if(target.tagName === "LI"){
      let text = target.innerText
      socket.emit("sendEmoji",{apiKey:apiKey,text:text})
    }
})

function addClassToButtons(yourMove){
  let buttons = document.querySelectorAll("button")
  buttons.forEach(btn => {
      btn.disabled = yourMove == true ? false : true
  });
}