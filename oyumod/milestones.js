const mc = require("./../mcdpi")

module.exports = {
	id: "mob-milestones",
	name: "Mob Milestones",
	desc: "Announces every 50th mob kill in chat.",
	updated: [2, 12, 23],
	data: {
		mobList: [
			"zombie", "husk", "drowned",
			"skeleton", "wither_skeleton", "stray",
			"spider", "cave_spider", 
			"creeper", "enderman", "witch", "phantom"
		],
		mobNameList: [
			"Zombie", "Husk", "Drowned",
			"Skeleton", "Wither Skeleton", "Stray",
			"Spider", "Cave Spider",
			"Creeper", "Enderman", "Witch", "Phantom"
		],
		pluralOverrides: {
			["Enderman"]: "Endermen",
			["Witch"]: "Witches"
		},
		bannerList: [
			// zombies
			["blue", "{Pattern:bts,Color:7},{Pattern:hh,Color:9}"],
			["brown", "{Pattern:bts,Color:7},{Pattern:hh,Color:4}"],
			["cyan", "{Pattern:bts,Color:7},{Pattern:hh,Color:12}"],
			// skeletons
			["gray", "{Pattern:sku,Color:0}"],
			["black", "{Pattern:sku,Color:7}"],
			["cyan", "{Pattern:sku,Color:8}"],
			// spiders
			["red", "{Pattern:flo,Color:15},{Pattern:sc,Color:15},{Pattern:hhb,Color:15},{Pattern:ts,Color:15},{Pattern:bo,Color:15}"],
			["red", "{Pattern:flo,Color:7},{Pattern:sc,Color:7},{Pattern:hhb,Color:7},{Pattern:ts,Color:7},{Pattern:bo,Color:7}"],
			// other
			["lime", "{Pattern:cre,Color:15}"],
			["black", "{Pattern:cre,Color:10},{Pattern:hhb,Color:15},{Pattern:ms,Color:15}"],
			["black", "{Pattern:mc,Color:5},{Pattern:ms,Color:8},{Pattern:hhb,Color:8},{Pattern:bs,Color:10}"],
			["blue", "{Pattern:ms,Color:5},{Pattern:hhb,Color:11},{Pattern:cs,Color:11},{Pattern:cbo,Color:8}"]
		]
	},
	load: data => {
		mc.addObjective("milestone_killed", "minecraft.custom:minecraft.mob_kills")
		for (let i in data.mobList) {
			let mob = data.mobList[i]
			mc.addObjective("milestone_killed_" + mob, "killed:" + mob)
		}
	},
	["tick-players"]: data => {
		mc.execute().if("score @s milestone_killed matches 1..").run("killed", () => {
			for (let i in data.mobList) {
				let mob = data.mobList[i]
				let mobName = data.mobNameList[i]
				let banner = data.bannerList[i]
				mc.execute().if(`score @s milestone_killed_${mob} matches 1..`).run(mob, () => {
					mc.addScore("#milestone_killed_" + mob, "var", 1)
					mc.execute().store("result score #temp var").run(`scoreboard players get #milestone_killed_${mob} var`)
					mc.setScore("#temp2", "var", 50)
					mc.command("scoreboard players operation #temp var %= #temp2 var")
					mc.execute().if("score #temp var matches 0").run("50", () => {
						mc.command(`tellraw @a [{"selector":"@s","color":"dark_purple"},{"text":" just killed the "},{"score":{"name":"#milestone_killed_${mob}","objective":"var"}},{"text":"th ${mobName}!"}]`)
						mc.command(`give @s ${banner[0]}_banner{display:{Name:'{"text":"${mobName} Banner","italic":false}',Lore:['{"text":"Awarded for killing 50 ${data.pluralOverrides[mobName] ? data.pluralOverrides[mobName] : mobName + "s"}.","color":"gold","italic":false}']},BlockEntityTag:{Patterns:[${banner[1]}]}}`)
					})
					mc.subtractScore("@s", `milestone_killed_${mob}`, 1)
				})
			}
			mc.subtractScore("@s", "milestone_killed", 1)
		})
	}
}