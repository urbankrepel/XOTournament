const formPrijava = document.querySelector(".form-prijava")

formPrijava.addEventListener("submit",e=>{
    e.preventDefault()

    let newFormData = new FormData(formPrijava)
    
    let ime = newFormData.get("ime")

    fetch('/post/vpisIgralca/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ime:ime})
  }).then(json=> {
      if(json.ok){
        return json.json()
      }
  })
  .then(data=>{
      location.pathname = "/cakalnica/"
      sessionStorage.setItem("apiKey",data.apiKey)
  })
})