const mc = require("./../mcdpi")

module.exports = {
	id: "join-messages",
	name: "Join Messages",
	desc: "Welcome messages for new and returning players.",
	hideInList: true,
	["welcome-new"]: () => {
		mc.command('tellraw @a [{"text":"Welcome ","color":"white"},{"selector":"@s","color":"yellow"},{"text":" to the server!","color":"white"}]')
	},
	["welcome-returning"]: () => {
		mc.command('tellraw @s [{"text":"Welcome back, ","color":"white"},{"selector":"@s","color":"yellow"},{"text":"!","color":"white"}]')
	}
}