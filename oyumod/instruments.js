const mc = require("./../mcdpi")
const util = require("./util")

module.exports = {
	id: "musical-instruments",
	name: "Musical Instruments",
	desc: "Items that play beautiful musical notes when held.",
	updated: [2, 13, 23],
	data: {
		instruments: [
			"didgeridoo",
			"flute",
			"bell",
			"guitar",
			"harp",
			"banjo",
			"xylophone",
			"bit",
			"chime"
		],
		drums: ["kick", "hat1", "snare", "hat2"]
	},
	init: data => {
		// hitsounds
		mc.hookAdvancement("hitsound", "player_hurt_entity", {}, () => {
			// drumsticks hitsound
			mc.command("tag @s[nbt={SelectedItem:{tag:{drumsticks:1b}}}] add drummer")
			mc.execute().as("@s[tag=drummer]").run("drumsticks", () => {

				// setup drum noise if they havent used drumsticks yet
				mc.command("tag @s[tag=!drum_kick,tag=!drum_hat1,tag=!drum_snare,tag=!drum_hat2] add drum_kick")

				// play drum noise
				mc.execute().as("@s[tag=drum_kick]").run("playsound block.note_block.basedrum master @a ~ ~ ~ 1 0.7")
				mc.execute().as("@s[tag=drum_hat1]").run("playsound block.note_block.hat master @a ~ ~ ~ 1 1.3")
				mc.execute().as("@s[tag=drum_snare]").run("playsound block.note_block.snare master @a ~ ~ ~ 1 0.7")
				mc.execute().as("@s[tag=drum_hat2]").run("playsound block.note_block.hat master @a ~ ~ ~ 1 1.3")

				// cycle next drum noise
				for (let i = 0; i < 4; i++)
					mc.command("tag @s[tag=drum_" + data.drums[i] + ",tag=!drum_" + data.drums[(i + 3) % 4] + "] add drum_" + data.drums[(i + 1) % 4])
				for (let i = 0; i < 4; i++)
					mc.command("tag @s[tag=drum_" + data.drums[i] + ",tag=drum_" + data.drums[(i + 1) % 4] + "] remove drum_" + data.drums[i])
			})

			// return to normal
			mc.command("tag @s remove drummer")
			mc.command("advancement revoke @s only musical-instruments:hitsound")
		})
	},
	["tick-entities"]: data => {
		// skeleton can play trumpet too :)
		mc.setScore("#can_play_instrument", "var", 0)
		mc.execute().as("@s[type=player]").if("data entity @s SelectedItem.tag.instrument").run("scoreboard players set #can_play_instrument var 1")
		mc.execute().as("@s[type=skeleton]").if("data entity @s HandItems[0].tag.instrument").run("scoreboard players set #can_play_instrument var 1")
		mc.execute().if("score #can_play_instrument var matches 1").percent(30).run("instrument", () => {
			mc.command("particle note ^-0.4 ^1 ^ 0 0 0 0.1 1 force")

			for (let i in data.instruments) {
				mc.execute().if(`data entity @s HandItems[0].tag.instrument_${data.instruments[i]}`).run(data.instruments[i], () => {
					let cmds = []
					for (let n = 0; n < 36; n++) {
						let top = ((n + 1) * 5)
						if (top < 180)
							top--

						cmds.push(`playsound block.note_block.${data.instruments[i]} master @a ~ ~ ~ 1 ${2 - ((n / 35) * 1.5)}`)
					}
					util.generateRandomScore("instrument_note", 36, cmds)
				})
			}
		})
	},
	["tick-entities-fresh"]: () => {
		// zombie with drum sticks
		mc.execute().as("@s[type=zombie]").percent(1).run("drummer", () => {
			const drumstick_nbt = `{id:"minecraft:stick",Count:1b,tag:{display:{Name:'{"text":"Drumsticks","color":"dark_aqua","italic":false}'},drumsticks:1b,Enchantments:[{}],AttributeModifiers:[{AttributeName:"generic.attack_damage",Name:"generic.attack_damage",Amount:2,Operation:0,UUID:[I;1821702917,1839415906,-1378302150,-1050781235],Slot:"mainhand"},{AttributeName:"generic.attack_damage",Name:"generic.attack_damage",Amount:2,Operation:0,UUID:[I;1806897970,-110539517,-2095567993,1940820790],Slot:"offhand"}]}}`
			for (let i = 0; i < 2; i++)
				mc.command(`data modify entity @s HandItems[${i}] set value ${drumstick_nbt}`)
			mc.command("data modify entity @s HandDropChances set value [1.0f, 1.0f]")
		})

		// skeleton with trumpet *DOOT DOOT*
		mc.execute().as("@s[type=skeleton]").percent(1).run("trumpet", () => {
			mc.command(`data modify entity @s HandItems[0] set value {id:"minecraft:golden_horse_armor",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:\'{"text":"Trumpet","color":"gold","italic":false}\'},Enchantments:[{id:-1}],instrument:1b,instrument_didgeridoo:1b}}`)
			mc.command("data modify entity @s HandDropChances[0] set value 1.0f")
		})
	},
	["tick-entities-fresh-trader"]: () => {
		// buyable instruments
		const desc = "Plays beautiful music when held."
		mc.execute().percent(15).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:10b},sell:{id:"minecraft:golden_horse_armor",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:'{"text":"Saxophone","color":"gold","italic":false}',Lore:['{"text":"${desc}","color":"gray","italic":false}']},instrument:1b,instrument_didgeridoo:1b}}}`)
		mc.execute().percent(15).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:10b},sell:{id:"minecraft:bone",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:'{"text":"Xylobone","color":"aqua","italic":false}',Lore:['{"text":"${desc}","color":"gray","italic":false}']},instrument:1b,instrument_xylophone:1b}}}`)
		mc.execute().percent(15).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:10b},sell:{id:"minecraft:iron_ingot",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:'{"text":"MC-600 Synthesizer","color":"dark_red","italic":false}',Lore:['{"text":"${desc}","color":"gray","italic":false}']},instrument:1b,instrument_bit:1b}}}`)
		mc.execute().percent(15).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:10b},sell:{id:"minecraft:bowl",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:'{"text":"Singing Bowl","color":"dark_green","italic":false}',Lore:['{"text":"${desc}","color":"gray","italic":false}']},instrument:1b,instrument_chime:1b}}}`)
	}
}
