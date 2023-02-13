const mc = require("./../mcdpi")

module.exports = {
	id: "all-you-zombies",
	name: "All You Zombies",
	updated: [2, 11, 23],
	desc: "Makes undead mobs a little scarier.",
	init: () => {
		mc.addTag(mc.tagType.entities, "armor_wearing_mobs", ["#minecraft:skeletons", "minecraft:zombie", "minecraft:husk", "minecraft:drowned"])
		mc.addTag(mc.tagType.blocks, "disposable_blocks", ["#minecraft:logs", "#minecraft:leaves", "#minecraft:enderman_holdable", "minecraft:air"])
	},
	["tick-entities"]: () => {
		// zombie tick
		mc.execute().as("@s[type=zombie]").run("z", () => {
			// convert zombies suffocating in sand to husks
			mc.execute().if("block ~ ~ ~ sand").if("block ~ ~1 ~ sand").run("turntohusk", () => {
				mc.command("summon husk")
				mc.command("kill @s")
			})

			// zombies rise from the earth
			mc.execute().if("block ~ ~ ~ #oyumod:dirt_or_grass").run("emerge", () => {
				mc.command("tp @s " + mc.relativeCoords(0, 0.1))
				mc.command("effect give @s slow_falling 1 255 true")
				mc.execute().percent(30).run("playsound block.wool.break master @a ~ ~ ~ 1 0.6")
				mc.execute().run("loop", () => {
					mc.execute().if("block ~ ~ ~ air").run("particle block dirt ~ ~ ~ 0.1 0.1 0.1 0.01 3 force")
					mc.execute().unless("block ~ ~ ~ air").positioned(mc.relativeCoords(0, 0.2)).recurse()
				})
			})
		})

		// husk tick
		mc.execute().as("@s[type=husk]").if("block ~ ~ ~ #minecraft:sand").run("husk-emerge", () => {
			// husks rise from the sand
			mc.command("tp @s " + mc.relativeCoords(0, 0.1))
			mc.command("effect give @s slow_falling 1 255 true")
			mc.execute().percent(30).run("playsound block.wool.break master @a ~ ~ ~ 1 0.6")
			mc.execute().run("loop", () => {
				mc.execute().if("block ~ ~ ~ air").run("particle block sand ~ ~ ~ 0.1 0.1 0.1 0.01 3 force")
				mc.execute().unless("block ~ ~ ~ air").positioned(mc.relativeCoords(0, 0.2)).recurse()
			})
		})
	},
	["tick-entities-fresh"]: () => {
		// freshly-spawned zombies and skeletons
		mc.execute().as("@s[type=#all-you-zombies:armor_wearing_mobs]").run("z", () => {
			// 40% to have a raincoat in the rain
			mc.execute().predicate("raining").if("block ~ ~-1 ~ grass_block").percent(40).run(`data modify entity @s ArmorItems[2] set value {id:"minecraft:leather_chestplate",Count:1b,tag:{display:{Name:\'{"text":"Raincoat","color":"yellow","italic":false}\',Enchantments:[{id:-1}],color:16383821}}}`)

			// buffed "paladins" in strongholds
			mc.execute().percent(60).if("block ~ ~-1 ~ #stone_bricks").run("paladin", () => {
				mc.command('data merge entity @s {ArmorItems:[{id:"minecraft:golden_boots",Count:1b},{id:"minecraft:golden_leggings",Count:1b},{id:"minecraft:golden_chestplate",Count:1b},{id:"minecraft:golden_helmet",Count:1b}]}')
				mc.execute().as("@s[type=zombie]").percent(60).run('data merge entity @s {HandItems:[{id:"minecraft:golden_axe",Count:1b,tag:{Enchantments:[{id:"minecraft:sharpness",lvl:3s}]}},{}]}')
			})

			mc.setScore("#zomb_has_helmet", "var", 0)

			// bonus chest boys
			mc.execute().percent(3).run("chest", () => {
				mc.command(`data merge entity @s {DeathLootTable:"chests/spawn_bonus_chest",ArmorItems:[{},{},{},{id:"minecraft:chest",Count:1b}],ArmorDropChances:[0.085F,0.085F,0.085F,0.000F]}`)
				mc.setScore("#zomb_has_helmet", "var", 1)
			})

			// health potion boys
			mc.execute().percent(6).run("potion", () => {
				mc.command(`data merge entity @s {HandItems:[{},{id:"minecraft:potion",Count:1b,tag:{Potion:"minecraft:healing"}}],HandDropChances:[0.000F,1.000F]}`)
				//mc.setScore("#zomb_has_helmet", "var", 1)
			})

			// wear a helmet in space (y level 250-330)
			mc.execute().if("score #zomb_has_helmet var matches 0").as("@s[y=290,dy=40]").run("space", () => {
				mc.command('data modify entity @s ArmorItems[3] set value {id:"minecraft:glass",Count:1b}')
				mc.command("data modify entity @s ArmorDropChances[3] set value 0F")
			})
		})

		// freshly-spawned creepers
		mc.execute().as("@s[type=creeper]").run("creeper", () => {
			// bride & groom
			mc.execute().percent(0.5).run("wedding", () => {
				mc.command('summon zombie ~ ~ ~ {Tags:["been_spawned"],HandItems:[{id:"minecraft:poppy",Count:1b},{}],HandDropChances:[1.000F,0.085F],ArmorItems:[{id:"minecraft:leather_boots",Count:1b,tag:{display:{color:0}}},{id:"minecraft:leather_leggings",Count:1b,tag:{display:{color:0}}},{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{color:0}}},{}],ArmorDropChances:[0.000F,0.000F,0.000F,0.085F]}')
				mc.command('summon skeleton ~ ~ ~ {Tags:["been_spawned"],HandItems:[{id:"minecraft:bow",Count:1b,tag:{display:{Name:\'{"text":"Bridal Bow","color":"light_purple","italic":false}\'},Enchantments:[{id:"minecraft:power",lvl:1s}]}},{}],HandDropChances:[0.3F,0.085F],ArmorItems:[{},{id:"minecraft:leather_leggings",Count:1b,tag:{display:{color:16777215}}},{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{color:16777215}}},{id:"minecraft:white_stained_glass",Count:1b}],ArmorDropChances:[0.085F,0.000F,0.000F,0.000F]}')
				mc.command("tp @s ~ -10 ~")
			})

			// herobrine shrine
			mc.execute().if("entity @p[distance=..80]").if("score #spawn_heroshrine var matches 1").run("shrinecheck", () => {
				// make sure a 3x3x3 is clear
				mc.setScore("#canSpawnShrine", "var", 1)
				for (let y = 0; y < 3; y++) {
					for (let x = -1; x < 2; x++) {
						for (let z = -1; z < 2; z++)
							mc.execute().unless("block " + mc.relativeCoords(x, y, z) + " #all-you-zombies:disposable_blocks").run("scoreboard players set #canSpawnShrine var 0")
					}
				}

				// spawn the shrine
				mc.execute().if("score #canSpawnShrine var matches 1").run("pass", () => {
					mc.command("fill " + mc.relativeCoords(-1, 0, -1) + " " + mc.relativeCoords(1, 2, 1) + " air")
					mc.command("fill " + mc.relativeCoords(-1, 0, -1) + " " + mc.relativeCoords(1, 0, 1) + " gold_block")
					mc.command("setblock ~ ~ ~ mossy_cobblestone")
					mc.command("setblock ~ ~1 ~ netherrack")
					mc.command("setblock ~ ~2 ~ fire")
					mc.command("setblock ~1 ~1 ~ redstone_torch")
					mc.command("setblock ~ ~1 ~1 redstone_torch")
					mc.command("setblock ~-1 ~1 ~ redstone_torch")
					mc.command("setblock ~ ~1 ~-1 redstone_torch")
					mc.command("setblock ~ 0 ~ light_gray_wool")
					mc.setScore("#spawn_heroshrine", "var", 0)
					mc.command("tp @s ~ -20 ~")
					mc.command('tellraw @a[distance=..100] {"text":"Nearby, a shrine has appeared...","color":"dark_aqua"}')
				})
			})
		})
	},
	["tick-entities-fresh-item"]: () => {
		// fresh flesh can summon zombies from the ground
		mc.execute().as('@s[nbt={Item:{id:"minecraft:rotten_flesh"}}]').percent(50).run("resur", () => {
			mc.execute().if("block ~ ~-3 ~ #oyumod:dirt_or_grass").if("block ~ ~-2 ~ #oyumod:dirt_or_grass").if("block ~ ~-1 ~ #oyumod:dirt_or_grass").run("zombie", () => {
				mc.execute().positioned(mc.relativeCoords(0, -2.6, 0)).run("summon zombie")
			})
			mc.execute().if("block ~ ~-3 ~ #minecraft:sand").if("block ~ ~-2 ~ #minecraft:sand").if("block ~ ~-1 ~ #minecraft:sand").run("husk", () => {
				mc.execute().positioned(mc.relativeCoords(0, -2.6, 0)).run("summon husk")
			})
		})

		// heroshrine core destroyed
		mc.execute().as('@s[nbt={Item:{id:"minecraft:mossy_cobblestone"}}]').if("block ~ 0 ~ light_gray_wool").run("shtf", () => {
			mc.command("setblock ~ 0 ~ bedrock")
			mc.command("particle cloud ~ ~ ~ 0 0 0 0.01 3 force")
			mc.command("playsound ambient.cave master @a ~ ~ ~ 1 2")
			mc.command("kill @s")
		})
	}
}