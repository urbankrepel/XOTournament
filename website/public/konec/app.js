const pName = document.querySelector(".p-ime")
const liRound = document.querySelector(".li-round")
const liPlace = document.querySelector(".li-place")

function loadData(){
    let apiKey = sessionStorage.getItem("apiKey")
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
      .then(igralec=>{
        if(igralec === undefined || igralec === null){
          window.location.pathname="/prijavaTekmovalcev/"
          return
        }else if(igralec.inGame){
            fetch('/post/isGameOver/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({apiKey:apiKey})
              }).then(json=> json.json())
              .then(data=>{
                if(!data.konec){
                  window.location.pathname="/cakalnica/"
                  return
                }
              })
        }
          pName.innerText = `${igralec.ime}`
          liRound.innerText = `Število odigranih iger: ${igralec.round}`
      })
      fetch('/post/kateroMesto/', {
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
            liPlace.innerText = `Mesto: ${data.mesto}.`
      })
}

loadData()