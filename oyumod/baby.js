const mc = require("./../mcdpi")
const util = require("./util")

module.exports = {
	id: "baby-mod",
	name: "Baby Making (W.I.P.)",
	desc: "Sleep next to your e-girlfriend to make a baby.",
	data: {
		baby_genders: [["boy", "Boy", "blue"], ["girl", "Girl", "light_purple"]],
		baby_names: [
			[
				"Christopher",
				"Paul",
				"David",
				"Marcel",
				"Nicholas",
				"Peter",
				"Jeremy",
				"Leeroy",
				"Baxter",
				"Michael",
				"Franklin",
				"Alexander",
				"Odysaeus",
				"Benjamin",
				"Vinny",
				"Samuel",
				"Scott",
				"Sue",
			],
			[
				"Elizabeth",
				"Hannah",
				"Rachel",
				"Jessica",
				"Sarah",
				"June",
				"April",
				"May",
				"Emily",
				"Deborah",
				"Nicole",
				"Daphne",
				"Eve",
				"Stephanie",
				"Ramona",
				"Prudence",
				"Victoria",
				"Sue",
			]
		]
	},
	init: () => {
		mc.hookAdvancement("sleep", "slept_in_bed", {}, () => {
			mc.command("tag @s add is_sleeping")
			mc.command("advancement revoke @s only baby-mod:start_sleeping")
		})
	},
	tick: data => {

		// baby grow up in off hand
		mc.command("scoreboard players add #baby_cooldown var 1")
		mc.execute().if("score #baby_cooldown var matches 100..").run("baby", () => {
			mc.command("scoreboard players set #baby_cooldown var 0")
			mc.execute().as("@a").as("@s[nbt={Inventory:[{Slot:-106b,tag:{baby:1b}}]}]").percent(10).run("hatch", () =>{
				util.generateRandomScore("baby_name", data.baby_names[0].length)
				for (let g = 0; g < 2; g++)
				{
					mc.execute().as(`@s[nbt={Inventory:[{Slot:-106b,tag:{baby_${data.baby_genders[g][0]}:1b}}]}]`).run(data.baby_genders[g][0], () => {
						for (let n = 0; n < data.baby_names[g].length; n++)
							mc.execute().if("score #baby_name var matches " + n).run(`item replace entity @s weapon.offhand with villager_spawn_egg{display:{Name:'{"text":"${data.baby_names[g][n]}"}',Lore:['[{"text":"Your baby ","color":"gray","italic":false},{"text":"${data.baby_genders[g][0]}","color":"${data.baby_genders[g][2]}","italic":false},{"text":" is ready to hatch!","color":"gray","italic":false}]']},EntityTag:{Age:-12000}}`)
					})
				}
			})
		})
	},
	["tick-players"]: data => {

		// sleep and baby make
		mc.execute().as("@s[tag=is_sleeping]").run("sleep", () => {
			mc.execute().store("result score #is_sleeping var").run("data get entity @s SleepTimer")
			mc.execute().if("score #is_sleeping var matches 0").run("stop", () => {
				// make baby
				mc.execute().as("@a[tag=is_sleeping,distance=..3,limit=1]").run("tag @s add parent")
				mc.execute().if("entity @a[tag=parent,limit=1]").run("baby", () => {
					mc.command("scoreboard players set #baby_gender var 0")
					mc.execute().percent(50).run("scoreboard players set #baby_gender var 1")
					for (let g = 0; g < 2; g++)
					{
						mc.execute().if("score #baby_gender var matches " + g).run(data.baby_genders[g][0], () => {
							mc.command(`give @s porkchop{display:{Name:'{"text":"Baby ${data.baby_genders[g][1]}","color":"${data.baby_genders[g][2]}","italic":false}',Lore:['{"text":"Hold in your offhand and it will grow!","color":"gray","italic":false}']},baby:1b,baby_${data.baby_genders[g][0]}:1b}`)
							mc.command(`tellraw @a [{"selector":"@s","color":"yellow","italic":false},{"text":" and ","color":"white","italic":false},{"selector":"@a[tag=parent]","color":"yellow","italic":false},{"text":" have had a baby ","color":"white","italic":false},{"text":"${data.baby_genders[g][0]}","color":"${data.baby_genders[g][2]}","italic":false},{"text":"!","color":"white","italic":false}]`)
						})
					}
				})
				mc.command("tag @a remove parent")

				// yawn
				mc.command("playsound entity.villager.ambient master @a ~ ~ ~ 1 0.5")
				mc.command('tellraw @s {"text":"*yawn*","color":"gray"}')

				// we're awake now
				mc.command("tag @s remove is_sleeping")
			})
		})
	}
}
