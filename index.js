const Discord = require("discord.js")
const fetch = require("node-fetch")
const keepAlive = require("./server")
const Database = require("@replit/database")

const db = new Database()
const client = new Discord.Client()

const sadWord = ["sad"]


const starterEncouragements = [
  "wah bete mauj krdi 🥳",
  "chal chal aave 😏",
  "Are you komedy me? 🤣 / bot",
  "Goli beta masti nahi 🦝 / bot",
  "hein! 😲",
  "bete ... bot se masti nahi 😆 / bot",
  "ok... continue 😗",
  "wait a minute... who are you?? 🤨",
  "aight imma head out 😐",
  "here ... have a toffee 🍬",
  "bot se hoshiyari 🐷"
]

db.get("encouragements").then(encouragements => {
  if (!encouragements || encouragements.length < 1) {
    db.set("encouragements", starterEncouragements)
  }
})

db.get("responding").then(value => {
  if (value == null) {
    db.set("responding", true)
  }
})


function updateEncouragements(encouragingMessage) {
  db.get("encouragements").then(encouragements => {
    encouragements.push([encouragingMessage])
    db.set("encouragements", encouragements)
  })
}

function deleteEncouragements(index) {
  db.get("encouragements").then(encouragements => {
    if (encouragements.length > index) {
      encouragements.splice(index, 1)
      db.set("encouragements", encouragements)
    }
  })
}

function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then(res => {
      return res.json()
    })
    .then(data => {
      return data[0]["q"] + "-" + data[0]["a"]
    })
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {

  if (msg.author.bot) return

  if (msg.content === "$inspire") {
    getQuote().then(quote => msg.channel.send(quote))
  }

  db.get("responding").then(responding => {
    if ( responding && sadWord.some(word => msg.content.includes(word))) {
      db.get("encouragements").then(encouragements => {
        const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
        msg.reply(encouragement)
      })
    }
  })



  if (msg.content.startsWith("$new")) {
    encouragingMessage = msg.content.split("$new ")[1]
    updateEncouragements(encouragingMessage)
    msg.channel.send("New inspiring message added.")
  }

  if (msg.content.startsWith("$del")) {
    index = parseInt(msg.content.split("$del ")[1])
    deleteEncouragements(index)
    msg.channel.send("Inspiring message deleted.")
  }

  if(msg.content.startsWith("$list")){
    db.get("encouragements").then(encouragements => {
      msg.channel.send(encouragements)
    })
  }

  if(msg.content.startsWith("$responding")){
    value = msg.content.split("$responding ")[1]

    if(value.toLowerCase() == "true"){
      db.set("responding", true)
      msg.channel.send("Responding is on.")
    } else{
      db.set("responding", false)
      msg.channel.send("Responding is off.")
    }
  }

})

keepAlive()

client.login(process.env.TOKEN)