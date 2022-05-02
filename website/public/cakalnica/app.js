var socket = io()
const textIme = document.querySelector(".tvoje-ime")
const textOdigranihRound = document.querySelector(".stOdigranihRund")
const textZmaganihRund = document.querySelector(".stZmaganihRund")
const btnZapusti = document.querySelector(".div-leave")

const apiKey = sessionStorage.getItem("apiKey")

function loadData(){
    fetch('/post/getData/', {
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
        // data == igralec
        if(data === undefined || data === null){
          window.location.pathname="/prijavaTekmovalcev/"
          return
        }else if(!data.inGame){
          window.location.pathname="/konec/"
          return
        }
          textIme.innerText = `Tvoje ime: ${data.ime}`
          textOdigranihRound.innerText = `Število odigranih iger: ${data.round}`
          textZmaganihRund.innerText = `Število zmaganih iger: ${data.score}`
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
        if(data === undefined){
          return
        }
        if(data.started){
          window.location.pathname="/igralnaPlosca/"
          return
        }
      })
      fetch('/post/isGameOver/', {
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
        if(data.konec){
          window.location.pathname="/konec/"
          return
        }
      })
}

function changeSizeOfLoadIcon(){
  let width = window.innerWidth;
  let height = window.innerHeight;

  let size = 50

  if(height < 865){
    let per = height / 865
    let newSize = size * per
    size = newSize
  }
  document.querySelector(".loader").style.width = `${size}px`
  document.querySelector(".loader").style.height = `${size}px`
}

function changeSizeOfText(){
  let width = window.innerWidth;
  let height = window.innerHeight;

  let size = 38

  if(width < 850){
    let per = width / 850
    let newSize = size * per
    size = newSize
  }
  let texts = document.querySelectorAll("h1")

  texts.forEach(text=>{
    text.style.fontSize = `${size}px`
  })
}

loadData()
setInterval(loadData,3000)
changeSizeOfLoadIcon()
changeSizeOfText()

socket.on("gameHasStarted",data=>{
     if(data.apiKey === apiKey){
       loadData()
     }
})

window.onresize = ()=>{
  changeSizeOfLoadIcon()
  changeSizeOfText()
}

btnZapusti.addEventListener("click",e=>{
  fetch('/post/leave/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({apiKey:apiKey})
  }).then(data=>{
    if(data.ok){
      location.pathname = "/home/"
      sessionStorage.setItem("apiKey","")
    }
  })
})