const mc = require("./../mcdpi")

module.exports = {
	id: "copper-tools",
	name: "Proper Copper",
	desc: "Copper can be used to craft gold tools.",
	updated: [2, 12, 23],
	data: {
		items: [
			["sword", [" C ", " C ", " S "]],
			["pickaxe", ["CCC", " S ", " S "]],
			["shovel", [" C ", " S ", " S "]],
			["axe", [" CC", " SC", " S "]],
			["hoe", [" CC", " S ", " S "]],
			["helmet", ["CCC", "C C", "   "]],
			["chestplate", ["C C", "CCC", "CCC"]],
			["leggings", ["CCC", "C C", "C C"]],
			["boots", ["C C", "C C", "   "]],
		]
	},
	init: data => {
		// craft gold tools with copper
		for (let i in data.items) { 
			let item = data.items[i]
			mc.shapedRecipe("copper_" + item[0], item[1], i > 4 ? [["C", "copper_ingot"]] : [["C", "copper_ingot"], ["S", "stick"]], "golden_" + item[0], 1)
		}
	}
}

/*
load: data => {
	for (let i in data.items) {
		let item = data.items[i]
		mc.addObjective("crafted_copper_" + item[0], `crafted:${i > 4 ? "leather" : "wooden"}_${item[0]}`)
	}
},
["tick-players"]: data => {
	for (let i in data.items) {
		let item = data.items[i]
		mc.execute().if(`score @s crafted_copper_${item[0]} matches 1..`).run("crafted-copper-" + item[0], () => {
			// /execute as  run say hi
			let itemstr = `${i > 4 ? "leather" : "wooden"}_${item[0]}`
			mc.execute().as(`@s[nbt={Inventory:[{id:"minecraft:${itemstr}",Count:2b}]}]`).run("give", () => {
				mc.command(`clear @s ${itemstr} 2`)
				mc.command(`give @s golden_${item[0]}{display:{Name:'{"text":"Copper ${item[0][0].toUpperCase() + item[0].slice(1)}","italic":false}'}}`)
			})
			mc.setScore("@s", "crafted_copper_" + item[0], 0)
		})
	}
}
*/
