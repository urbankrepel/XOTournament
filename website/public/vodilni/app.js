const listaIgralcev = document.querySelector(".lista-igralcev")
const listaVCakalnici = document.querySelector(".lista-vCakalnici")
const playersStatusP = document.querySelector(".playersStatus")

function naloziPodatke(){
    let username = document.getElementById("user").value
    let password = document.getElementById("pass").value
    fetch('/post/listaIgralcev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username:username,password:password})
      }).then(json=>json.json()).then(data=>{
          clearElement(listaIgralcev)
          data.forEach(igralec=>{
            let li = document.createElement("li")
            li.innerText = igralec.ime
            li.id = igralec.api
            li.addEventListener("mouseenter",e=>{
                li.style.textDecoration = "line-through"
                li.style.color = "red"
            })
            li.addEventListener("mouseleave",e=>{
                li.style.textDecoration = ""
                li.style.color = ""
            })
            listaIgralcev.appendChild(li)
          })
      })

      osvežiCakalnico()
      osveziStatusIgralcev()
}

function clearElement(element){
    while(element.firstChild){
        element.removeChild(element.firstChild)
    }
}

function osveziStatusIgralcev(){
  fetch('/get/playerCheck/').then(json=>json.json()).then(data=>{
    let playerCheck = data.playerCheck
    if(playerCheck !== undefined){
      if(playerCheck == 0){
        playersStatusP.innerText = "Lahko začnete igro.✅"
        playersStatusP.style.color = "green"
      }else{
        playersStatusP.innerText = `Št. igralcev, ki jih še potrebujete: ${playerCheck}.❌`
        playersStatusP.style.color = "red"
      }
    }
  })
}

listaIgralcev.addEventListener("click",e=>{
    let target = e.target
    if(target.tagName === "LI"){
        let id = target.id
        fetch('/post/leave/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({apiKey:id})
          })
    }
    naloziPodatke()
})

function start(){
  let username = document.getElementById("user").value
  let password = document.getElementById("pass").value
  fetch('/post/start/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username:username,password:password})
    }).then(json=>json.json())
    .then(data=>{
      if(data.error !== undefined){
        alert(`Error: ${data.error}`)
      }
    })
}

function razporedVEkipe(){
  let username = document.getElementById("user").value
  let password = document.getElementById("pass").value
  fetch('/post/razporediVEkipe/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username:username,password:password})
  }).then(json=>json.json())
  .then(data=>{
    if(data.error !== undefined){
      alert(`Error: ${data.error}`)
    }
    clearElement(listaVCakalnici)
    for(let i=0;i<data.length;i++){
      let element = data[i]
      let li = document.createElement("li")
      let text = `Igra: ${element.player.ime} vs. ${element.player2.ime}`
      li.innerText = text
      listaVCakalnici.appendChild(li)
    }
  })
}

function osvežiCakalnico(){
  let username = document.getElementById("user").value
  let password = document.getElementById("pass").value
  fetch('/post/listaVCakalnici/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username:username,password:password})
  }).then(json=>json.json())
  .then(data=>{
    clearElement(listaVCakalnici)
    for(let i=0;i<data.length;i++){
      let element = data[i]
      let li = document.createElement("li")
      let text = `Igra: ${element.player.ime} vs. ${element.player2.ime}`
      li.innerText = text
      listaVCakalnici.appendChild(li)
    }
  })
}

function resetirajEkipe(){
    let username = document.getElementById("user").value
    let password = document.getElementById("pass").value

    fetch('/post/resetCakalnici/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username:username,password:password})
  }).then(data=>{
    osvežiCakalnico()
  })
}

naloziPodatke()
setInterval(naloziPodatke,3000)