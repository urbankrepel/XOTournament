const menu = document.querySelector(".menu")
const cssButton = document.querySelector(".credentials")
function toPrijava(){
    location.pathname = "/prijavaTekmovalcev/"
}
function openMenu(){
    menu.style.height = "200px"
    menu.style.display = "block"
}
function closeMenu(){
    menu.style.height = ""
    menu.style.display = ""
}
cssButton.addEventListener("selectstart",e=>{
    openMenu()
})
document.addEventListener("keydown",e=>{
    if(e.keyCode == 27){
        closeMenu()
    }
})