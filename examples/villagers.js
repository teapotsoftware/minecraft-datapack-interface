
// EXAMPLE - Villager Names
// Give villagers random names from an array.

const mc = require("../mcdpi")
const packname = "villager_names"

const names = ["Abraham", "Ezekiel", "Adam", "Abigail", "Ezra", "Amos", "Paul", "David", "Prudence", "Benjamin", "Hannah", "Daniel", "Deborah", "Eden", "Ebenezer", "Jeremiah", "Elijah", "Peter", "Abiathar", "Rebecca", "Jeremy", "Gabriel", "Isaac", "Maxwell", "Jacob", "Caleb", "Jared", "Levi", "Jessica", "Lilah", "Joel", "Sarah", "Micah", "Jordan", "Simon", "Jackson", "Judah", "Roy", "Muhammad", "Judith", "Samuel", "Noah", "Edward", "Rachel", "Solomon", "Tamara", "Aaron", "Tyrone", "Nicholas", "Parker", "Trevor", "Baxter", "Mary", "Jaden", "Ross", "Harold", "Christopher", "Allen", "Steph", "Alexander"]

mc.startPack(packname, "Gives villagers random names.")
mc.namespace(packname)

mc.addTag(mc.tagType.entities, "villagers", ["minecraft:villager", "minecraft:wandering_trader"])

mc.createFunction("slow_tick", () => {
	mc.execute().as(`@e[type=#${packname}:villagers,tag=!given_name]`).run("give_name", () => {
		for (let i = 0; i < names.length; i++)
		{
			let n = (i * 6) - 180
			mc.command(`execute as @s[y_rotation=${n}..${n + 6}] run data merge entity @s {CustomNameVisible:1b,CustomName:'{"text":"${names[i]}"}'}`)
		}
		mc.command("tag @s add given_name")
	})
	mc.scheduleFunction("slow_tick", 20)
})
mc.hook("load", "slow_tick")
