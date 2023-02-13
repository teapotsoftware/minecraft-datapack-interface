const mc = require("./../mcdpi")

module.exports = {
	id: "death-counter",
	name: "Death Counter",
	desc: "Every time a player dies, an announcement will be made informing the server just how bad they are.",
	updated: [2, 12, 23],
	data: {
		funfacts: [
			["deathtime", "..200", () => {
				mc.setScore("#temp", "var", 20)
				mc.command(`scoreboard players operation @s deathstat_deathtime /= #temp var`)
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" was alive for "},{"score":{"name":"@s","objective":"deathstat_deathtime","color":"aqua"}},{"text":" seconds that life."}]`)
			}],
			["fish", "1..", () => {
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" caught "},{"score":{"name":"@s","objective":"deathstat_fish","color":"aqua"}},{"text":" fish that life."}]`)
			}],
			["dmgtaken", "50..", () => {
				mc.setScore("#temp", "var", 2)
				mc.command(`scoreboard players operation @s deathstat_dmgtaken /= #temp var`)
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" took "},{"score":{"name":"@s","objective":"deathstat_dmgtaken","color":"aqua"}},{"text":" hearts of damage that life."}]`)
			}],
			["jump", "100..", () => {
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" jumped "},{"score":{"name":"@s","objective":"deathstat_jump","color":"aqua"}},{"text":" times that life."}]`)
			}],
			["enchant", "5..", () => {
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" enchanted "},{"score":{"name":"@s","objective":"deathstat_enchant","color":"aqua"}},{"text":" items that life."}]`)
			}],
			["chest", "50..", () => {
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" opened "},{"score":{"name":"@s","objective":"deathstat_chest","color":"aqua"}},{"text":" chests that life."}]`)
			}],
			["deathtime", "144000..", () => {
				mc.setScore("#temp", "var", 72000)
				mc.command(`scoreboard players operation @s deathstat_deathtime /= #temp var`)
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" was alive for "},{"score":{"name":"@s","objective":"deathstat_deathtime","color":"aqua"}},{"text":" hours that life."}]`)
			}],
			["sprint", "100000..", () => {
				mc.setScore("#temp", "var", 100)
				mc.command(`scoreboard players operation @s deathstat_sprint /= #temp var`)
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" sprinted "},{"score":{"name":"@s","objective":"deathstat_sprint","color":"aqua"}},{"text":" blocks that life."}]`)
			}],
			["fall", "30000..", () => {
				mc.setScore("#temp", "var", 100)
				mc.command(`scoreboard players operation @s deathstat_fall /= #temp var`)
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" fell "},{"score":{"name":"@s","objective":"deathstat_fall","color":"aqua"}},{"text":" blocks that life."}]`)
			}],
			["crouch", "5000..", () => {
				mc.setScore("#temp", "var", 100)
				mc.command(`scoreboard players operation @s deathstat_crouch /= #temp var`)
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" crouched "},{"score":{"name":"@s","objective":"deathstat_crouch","color":"aqua"}},{"text":" blocks that life."}]`)
			}],
			["drop", "100..", () => {
				mc.command(`tellraw @a [{"selector":"@s","color":"gray"},{"text":" dropped "},{"score":{"name":"@s","objective":"deathstat_drop","color":"aqua"}},{"text":" items that life."}]`)
			}],
		]
	},
	load: () => {
		mc.command(`scoreboard objectives add deathcouther deathCount {"text":"Deaths","color":"dark_red","bold":true}`)
		mc.command(`scoreboard objectives add deathcheck deathCount "death check"`)

		// stats
		mc.command(`scoreboard objectives add deathstat_jump minecraft.custom:minecraft.jump`)
		mc.command(`scoreboard objectives add deathstat_dmgtaken minecraft.custom:minecraft.damage_taken`)
		mc.command(`scoreboard objectives add deathstat_dmgdealt minecraft.custom:minecraft.damage_dealt`)
		mc.command(`scoreboard objectives add deathstat_chest minecraft.custom:minecraft.open_chest`)
		mc.command(`scoreboard objectives add deathstat_fish minecraft.custom:minecraft.fish_caught`)
		mc.command(`scoreboard objectives add deathstat_drop minecraft.custom:minecraft.drop`)
		mc.command(`scoreboard objectives add deathstat_enchant minecraft.custom:minecraft.enchant_item`)
		mc.command(`scoreboard objectives add deathstat_sprint minecraft.custom:minecraft.sprint_one_cm`)
		mc.command(`scoreboard objectives add deathstat_fall minecraft.custom:minecraft.fall_one_cm`)
		mc.command(`scoreboard objectives add deathstat_crouch minecraft.custom:minecraft.crouch_one_cm`)
		mc.command(`scoreboard objectives add deathstat_deathtime dummy`)
	},
	["tick-players"]: data => {
		mc.execute().if("score @s deathcheck matches 1..").run("death", () => {
			mc.command(`tellraw @a [{"text":"<","color":"white"},{"text":"DeathCounter","color":"dark_red"},{"text":"> "},{"selector":"@s"},{"text":" has died "},{"score":{"name":"@s","objective":"deathcouther"},"color":"red","bold":true},{"text":" times."}]`)
			mc.setScore("#deathstat_shown", "var", 0)
			for (let i in data.funfacts) {
				let fact = data.funfacts[i]
				mc.execute().if(`score #deathstat_shown var matches 0`).if(`score @s deathstat_${fact[0]} matches ${fact[1]}`).run("fact" + i, () => {
					fact[2]()
					mc.setScore("#deathstat_shown", "var", 1)
				})
			}
			let scr = [
				"deathstat_jump",
				"deathstat_dmgtaken",
				"deathstat_dmgdealt",
				"deathstat_chest",
				"deathstat_fish",
				"deathstat_drop",
				"deathstat_enchants",
				"deathstat_deathtime",
				"deathcheck"
			]
			for (let i in scr) {
				mc.setScore("@s", scr[i], 0)
			}
		})
		mc.addScore("@s", "deathstat_deathtime", 1)
	}
}