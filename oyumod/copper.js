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
