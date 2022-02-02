const moment = require('moment')

const generateObject = (text, username) => {
    return {
        text,
        createdAt: moment(new Date().getTime()).format("ddd, MMM Do YYYY, h:mm:ss a"),
        username
    }
}

module.exports = {
    generateObject
}