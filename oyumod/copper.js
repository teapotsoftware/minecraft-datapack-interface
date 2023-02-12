const mc = require("./../mcdpi")

module.exports = {
	id: "copper-tools",
	name: "Copper tools",
	desc: "Copper can be used to craft gold tools.",
	init: () => {
		// craft gold tools with copper
		mc.shapedRecipe("copper_sword", [" C ", " C ", " S "], [["C", "copper_ingot"], ["S", "stick"]], "golden_sword", 1)
		mc.shapedRecipe("copper_pickaxe", ["CCC", " S ", " S "], [["C", "copper_ingot"], ["S", "stick"]], "golden_pickaxe", 1)
		mc.shapedRecipe("copper_shovel", [" C ", " S ", " S "], [["C", "copper_ingot"], ["S", "stick"]], "golden_shovel", 1)
		mc.shapedRecipe("copper_axe", [" CC", " SC", " S "], [["C", "copper_ingot"], ["S", "stick"]], "golden_axe", 1)
		mc.shapedRecipe("copper_hoe", [" CC", " S ", " S "], [["C", "copper_ingot"], ["S", "stick"]], "golden_hoe", 1)
		mc.shapedRecipe("copper_helmet", ["CCC", "C C", "   "], [["C", "copper_ingot"]], "golden_helmet", 1)
		mc.shapedRecipe("copper_chestplate", ["C C", "CCC", "CCC"], [["C", "copper_ingot"]], "golden_chestplate", 1)
		mc.shapedRecipe("copper_leggings", ["CCC", "C C", "C C"], [["C", "copper_ingot"]], "golden_leggings", 1)
		mc.shapedRecipe("copper_boots", ["C C", "C C", "   "], [["C", "copper_ingot"]], "golden_boots", 1)
	}
}