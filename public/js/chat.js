const socket = io()

//Message elements
const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.querySelector('input')                       //  const text = e.target.elements.message.value  // const text = document.querySelector('input').value
const $messageButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

//Location elements
const $locationButton = document.querySelector('#location')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $roomTemplate = document.querySelector('#sidebar-template').innerHTML
const $roomDiv = document.querySelector('#room')

//Query
const {username, room} = Qs.parse(location.search, {  ignoreQueryPrefix: true })             //parse the arguments in the url when one goes from join page to chat page as key-value pairs (qs imported in chat.html with ajax)
//location.search can be typed in the browser's console to check functionality 

const autoscroll= () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of $newMessage
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin     //offsetHeight doesn't take into account the margin, therefore, adding margin
  
    //visible height - doesn't change
    const visibleHeight =  $messages.offsetHeight

    //height of messages container - total height of all the messages (even those not visible on the screen)
    const containerHeight =  $messages.scrollHeight

    //how much did I scroll?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(scrollOffset + newMessageHeight >= containerHeight)
        $messages.scrollTop = $messages.scrollHeight        //scroll all the way down only if we are at the bottom of the chats 
}

socket.on("message", (data) => {
    console.log(data)
    const html =  Mustache.render($messageTemplate, {
        message: data.text,
        createdAt: data.createdAt,
        username: data.username
    })
    $messages.insertAdjacentHTML('beforeend', html)              //beforeend => latest messages at the bottom of the div, afterbegin => latest messages on top of the div
    autoscroll()
})

socket.on('location-message', (data) => {
    console.log(data)
    const html = Mustache.render($locationTemplate, {
        url: data.text,
        createdAt: data.createdAt,
        username: data.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {                     //aliter: document.querySelector('button-id').addEventListener('click', ....)
    e.preventDefault()
    $messageButton.setAttribute('disabled', 'disabled')             // To set the value of a Boolean attribute, such as disabled, you can specify any value. An empty string or the name of the attribute are recommended values. All that matters is that if the attribute is present at all, regardless of its actual value, its value is considered to be true. The absence of the attribute means its value is false. 
    
    socket.emit('sendMessage', $messageInput.value, (error)=>{                     //client(emit) -> server(receive) -- sends acknowledgement (3rd argument of emit)-->client
        $messageButton.removeAttribute('disabled')                //as soon as acknowledgement received from server, button enabled.   
        $messageInput.value = ''
        $messageInput.focus()               //sets cursor within the messageInput
        if(error)     
        {
            location.href = '/'
            return alert(error)
        }  
        console.log('Message delivered!')
    })
})

//share client's location with other clients
$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation)                                      // if geolocation object doesn't exist
        return alert('Geolocation is not supported in your browser.')

        $locationButton.setAttribute('disabled', 'disabled')
        navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position['coords'].latitude
        const longitude =  position['coords'].longitude

        socket.emit('sendLocation', {latitude, longitude}, (error) => {
           if(!error){
                $locationButton.removeAttribute('disabled')
                console.log('Location shared!')
           }
           else{
                location.href = '/'
                return alert(error)
           }
            
        })              
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error)
    {
        alert(error)
        location.href = '/'                 //redirects user to home page
    }
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render($roomTemplate, {
        room, 
        users
    })
    $roomDiv.innerHTML = html           //not 'beforeend' type or so because then the whole {room users username} div would get attached every time before the end
})


//receive data from the server
// socket.on('countUpdated', (count) => {
//     console.log('Count is updated to ' + count)
// })

//send increment to server
// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked!')
//     socket.emit('increment')
// })
