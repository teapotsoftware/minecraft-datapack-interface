const mc = require("./../mcdpi")
const util = require("./util")

module.exports = {
	id: "disc-trader",
	name: "Wandering DJ",
	desc: "I'm a Wandering Trader and my rhymes are sick. I buy a random disc for 4 and sell one for 6.",
	["tick-entities-fresh-trader"]: () => {
		// buy and sell a random disc
		const discs = ["11", "13", "cat", "blocks", "mall", "mellohi", "chirp", "pigstep", "ward", "far", "stal", "strad"]
		util.generateRandomScore("trader_disc", discs.length, (i) => {
			mc.command(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:6b},sell:{id:"minecraft:music_disc_${discs[i]}",Count:1b}}`)
		})
		util.generateRandomScore("trader_disc", discs.length, (i) => {
			mc.command(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:music_disc_${discs[i]}",Count:1b},sell:{id:"minecraft:emerald",Count:4b}}`)
		}, "b") // sets this loops functions apart
	}
}