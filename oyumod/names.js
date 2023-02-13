const mc = require("./../mcdpi")
const util = require("./util")

module.exports = {
	id: "villager-names",
	name: "Villager Names",
	desc: "Villagers have random names.",
	updated: [2, 11, 23],
	data: {
		names: ["Abraham", "Ezekiel", "Adam", "Abigail", "Ezra", "Amos", "Paul", "David", "Prudence", "Benjamin", "Hannah", "Daniel", "Deborah", "Eden", "Ebenezer", "Jeremiah", "Elijah", "Peter", "Abiathar", "Rebecca", "Jeremy", "Gabriel", "Isaac", "Maxwell", "Jacob", "Caleb", "Jared", "Levi", "Jessica", "Lilah", "Joel", "Sarah", "Micah", "Jordan", "Simon", "Jackson", "Judah", "Roy", "Muhammad", "Judith", "Samuel", "Noah", "Edward", "Rachel", "Solomon", "Tamara", "Aaron", "Tyrone", "Nicholas", "Parker", "Trevor", "Baxter", "Mary", "Jaden", "Ross", "Harold", "Christopher", "Allen", "Steph", "Alexander"]
	},
	init: () => {
		mc.addTag(mc.tagType.entities, "villager-esque", ["minecraft:villager", "minecraft:wandering_trader"])
	},
	["tick-entities"]: data => {
		mc.execute().as("@s[type=#villager-names:villager-esque,tag=!given_name]").run("name", () => {
			util.generateRandomScore("villager_name", data.names.length, (i) => {
				mc.command(`data merge entity @s {CustomName:'{"text":"${data.names[i]}"}'}`)
			})
			mc.command("tag @s add given_name")
		})
	}
}