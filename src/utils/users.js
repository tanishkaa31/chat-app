const users = []

//add new user in room
const addUser = (id, username, room) => {
    //trim (remove extra spaces before and after) and convert to lower case
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate if user and room present
    if(!username || !room)
        return {
            "error" : "Username and room are required fields."
        }

    //validate if username exists in that particular room
    const isPresent = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(isPresent)
        return {
            "error": "Username already taken. Please choose another username."
        }

    //store new user in users
    const user = {id, username, room}
    users.push(user)
    return { user }
}

//remove user from room
const removeUser = (id) => {

    // users = users.filter((user) => {
    //     return user.id != id                             //will iterate for ALL users
    // })
    const index = users.findIndex((user) => user.id === id)     //will stop as soon as user found
    if(index != -1)
    {   
        return users.splice(index, 1)[0]                //details of deleted user       
    }
}               //returns only when index!=-1, i.e., user with given ID is found.

//get User by ID
const getUser = (id) => users.find((user) => user.id === id)

//get all users in Room
const getUsersinRoom = (room) => users.filter((user) => user.room === room.trim().toLowerCase())

module.exports = {
    addUser,
    removeUser, 
    getUser,
    getUsersinRoom
}