const socket = io()

const $messageForm = document.querySelector('form')
const $messageFormInput = $messageForm.querySelector('input')
const $sendButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#location')
const $messages = document.querySelector('#messages')
const messageTemplateIn = document.querySelector('#message-template-in').innerHTML
const messageTemplateOut = document.querySelector('#message-template-out').innerHTML
const locationTemplateIn = document.querySelector('#location-template-in').innerHTML
const locationTemplateOut = document.querySelector('#location-template-out').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room }= Qs.parse(location.search, { ignoreQueryPrefix: true })





socket.on('message', (message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplateIn, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
     const html2 = Mustache.render(messageTemplateOut, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    if(username.toLowerCase() == message.username){
    $messages.insertAdjacentHTML('beforeend', html)
    }
    else{
    $messages.insertAdjacentHTML('beforeend', html2)
    }
    autoscroll()
})

socket.on('locationMessage', (url) =>{
    console.log(url)
    const html = Mustache.render(locationTemplateIn, {
        username: url.username,
        message: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
     const html2 = Mustache.render(locationTemplateOut, {
        username: url.username,
        message: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    if(username.toLowerCase() == url.username){
    $messages.insertAdjacentHTML('beforeend', html)
    }
    else{
    $messages.insertAdjacentHTML('beforeend', html2)
    }
    autoscroll()
})

$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault()
    $sendButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.msg.value


    socket.emit('sendMessage', message, (message)=>{
        $sendButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log('The message was delivered', message)
    })
})

$sendLocation.addEventListener('click', ()=> {
    if(!navigator.geolocation){
        return alert('Get a better browser')
    }
        $sendLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((pos)=> {

        socket.emit('sendLocation', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }, ()=> {
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.on('roomUsers', ({ room, users }) => {
   const html = Mustache.render(sidebarTemplate, {
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

const autoscroll = () => {
    const newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    const visibleheight = $messages.offsetHeight 

    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleheight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}