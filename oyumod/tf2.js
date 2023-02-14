const mc = require("./../mcdpi")
const util = require("./util")

module.exports = { // mine co supply eggs
	id: "supply-eggs",
	name: "Mine Co. Supply Eggs",
	desc: "TF2 crates, but in Minecraft.",
	updated: [2, 13, 23],
	data: {
		color_unique: "#FFD700",
		color_strange: "#CF6A32",
		color_unusual: "#8650AC",
		strange_wep_types: [["sword", "Sword"], ["axe", "Axe"]],
		strange_wep_tiers: ["stone", "golden", "iron", "diamond"],
		unusual_types: [
			["leather", "Leather Cap"],
			["chainmail", "Chainmail Helmet"],
			["iron", "Iron Helmet"],
			["golden", "Golden Helmet"],
			["diamond", "Diamond Helmet"],
			["turtle", "Turtle Shell"],
		],
		// stored as [id, name, name color, effect command]
		unusual_effects: [
			["flame", "Hot Head", "#FF513D", "particle flame ^ ^0.5 ^ 0.1 0.1 0.1 0.01 2 force"],
			["bubble", "Bubbling", "#3B9DFF", "particle bubble_pop ^ ^0.5 ^ 0.1 0.1 0.1 0.01 2 force"],
			["party", "Confetti", "#B6FF6E", [
				"particle dust 1.0 1.0 0.0 1.0 ^ ^0.5 ^ 0.1 0.1 0.1 0.001 2 force",
				"particle dust 0.0 1.0 0.0 1.0 ^ ^0.5 ^ 0.1 0.1 0.1 0.001 2 force",
				"particle dust 1.0 0.0 1.0 1.0 ^ ^0.5 ^ 0.1 0.1 0.1 0.001 2 force",
				"particle dust 0.0 1.0 1.0 1.0 ^ ^0.5 ^ 0.1 0.1 0.1 0.001 2 force"
			]],
			["void", "Void", "#521D7A", "particle portal ^ ^0.5 ^ 0.1 0.1 0.1 0.001 3 force"],
			["angry", "I Hate Mondays", "dark_red", () => {
				mc.execute().percent(50).run("particle angry_villager ^ ^0.5 ^ 0.1 0.1 0.1 0.01 1 force")
			}],
			["heart", "Tripping Over You", "#FF38FF", "particle heart ^ ^0.6 ^ 0.2 0.1 0.2 0.01 1 force"],
			["money", "Greedy Grabbler", "#70B04A", "particle happy_villager ^ ^0.6 ^ 0.1 0.1 0.1 0.01 2 force"],
			["wine", "Dionysus", "#7221FF", "particle witch ^ ^0.5 ^ 0.1 0.1 0.1 0.005 2 force"],
			["miami", "Miami", "#45FFEC", [
				"particle dust_color_transition 1.0 0.0 1.0 0.8 0.0 0.7 1.0 ^ ^0.5 ^ 0.1 0.1 0.1 0.01 2 force",
				"particle dust_color_transition 0.0 0.7 1.0 0.8 1.0 0.0 1.0 ^ ^0.5 ^ 0.1 0.1 0.1 0.01 2 force"
			]],
			["souls", "Septem Solaria", "#6D8535", () => {
				mc.execute().percent(50).run("particle soul ^ ^0.7 ^ 0.1 0.1 0.1 0.01 1 force")
			}],
		],
		// stored as [id, name]
		strange_weapons: [["sword", "Sword"], ["axe", "Axe"], ["bow", "Bow"]],
		// stored as [minimum kills, prefix]
		strange_prefixes: [
			[
				[0, "Strange"],
				[5, "Unremarkable"],
				[10, "Scarcely Lethal"],
				[20, "Mildly Menacing"],
				[35, "Somewhat Threatening"],
				[50, "Uncharitable"],
				[65, "Notably Dangerous"],
				[90, "Sufficiently Lethal"],
				[100, "Truly Feared"],
				[120, "Spectacularly Lethal"],
				[150, "Gore-Spattered"],
				[175, "Wicked Nasty"],
				[200, "Positively Inhumane"],
				[249, "Totally Ordinary"],
				[250, "Face-Melting"],
				[275, "Rage-Inducing"],
				[300, "Server-Clearing"],
				[333, "Epic"],
				[390, "Legendary"],
				[420, "Minecraftian"],
				[500, "Herobrine\\'s Own"]
			],
			[
				[0, "Strange"],
				[5, "Unremarkable"],
				[10, "Scarcely Lethal"],
				[20, "Mildly Menacing"],
				[35, "Somewhat Threatening"],
				[50, "Uncharitable"],
				[65, "Notably Dangerous"],
				[90, "Sufficiently Lethal"],
				[100, "Truly Feared"],
				[120, "Spectacularly Lethal"],
				[150, "Gore-Spattered"],
				[175, "Wicked Nasty"],
				[200, "Positively Inhumane"],
				[249, "Totally Ordinary"],
				[250, "Face-Melting"],
				[275, "Rage-Inducing"],
				[300, "Server-Clearing"],
				[333, "Epic"],
				[390, "Legendary"],
				[420, "Minecraftian"],
				[500, "Herobrine\\'s Own"]
			],
			[
				[0, "Strange"],
				[5, "Unremarkable"],
				[10, "Scarcely Lethal"],
				[20, "Mildly Menacing"],
				[35, "Somewhat Threatening"],
				[50, "Uncharitable"],
				[65, "Notably Dangerous"],
				[90, "Sufficiently Lethal"],
				[100, "Truly Feared"],
				[120, "Spectacularly Lethal"],
				[150, "Gore-Spattered"],
				[175, "Wicked Nasty"],
				[200, "Positively Inhumane"],
				[249, "Totally Ordinary"],
				[250, "Face-Melting"],
				[275, "Rage-Inducing"],
				[300, "Server-Clearing"],
				[333, "Epic"],
				[390, "Legendary"],
				[420, "Minecraftian"],
				[500, "Herobrine\\'s Own"]
			]
		],
		get supply_egg_nbt() {
			return `{display:{Name:'{"text":"Mine Co. Supply Egg","color":"${this.color_unique}","italic":false}',Lore:['{"text":"May contain:","color":"gray","italic":false}','{"text":"- Strange Stone Sword","color":"dark_gray","italic":false}','{"text":"- Strange Golden Sword","color":"dark_gray","italic":false}','{"text":"- Strange Iron Sword","color":"dark_gray","italic":false}','{"text":"- Strange Diamond Sword","color":"dark_gray","italic":false}','{"text":"- Strange Stone Axe","color":"dark_gray","italic":false}','{"text":"- Strange Golden Axe","color":"dark_gray","italic":false}','{"text":"- Strange Iron Axe","color":"dark_gray","italic":false}','{"text":"- Strange Diamond Axe","color":"dark_gray","italic":false}','{"text":"- Strange Bow","color":"dark_gray","italic":false}','{"text":"...or an exceedingly rare special item!","color":"yellow","italic":true}']},Enchantments:[{}],EntityTag:{id:"minecraft:item",Item:{id:"minecraft:chest",Count:1b,tag:{supply_egg:1b}}}}`
		}
	},
	init: () => {
		mc.shapedRecipe("supply_egg", ["###", "#N#", "###"], [["#", "gold_ingot"], ["N", "chest"]], "command_block", 1)

		mc.hookAdvancement("craft-supply-egg", "inventory_changed", {
			items: [{item: "minecraft:command_block"}],
		}, () => {
			mc.command("tag @s add crafted_supply_egg")
			mc.command("advancement revoke @s only supply-eggs:craft-supply-egg")
		})
	},
	load: () => {
		mc.addObjective("strange_kills", "totalKillCount")
		mc.setScore("#unusual_cooldown", "var", 3)
	},
	tick: () => {
		mc.subtractScore("#unusual_cooldown", "var", 1)
		mc.execute().if("score #unusual_cooldown var matches ..0").run("scoreboard players set #unusual_cooldown var 3")
	},
	["tick-players"]: data => {
		// give the crafted supply eggs
		mc.execute().as("@s[tag=crafted_supply_egg]").run("craft-supply-egg", () => {
			mc.execute().store("result score #crafted_supply_egg var").run("clear @s command_block")
			mc.execute().if("score #crafted_supply_egg var matches 1..").run("give-cube", () => {
				mc.command(`give @s villager_spawn_egg${data.supply_egg_nbt}`)
				mc.subtractScore("#crafted_supply_egg", "var", 1)
				mc.execute().if("score #crafted_supply_egg var matches 1..").recurse()
			})
			mc.command("tag @s remove crafted_supply_egg")
		})

		// unusual hats
		mc.execute().if("score #unusual_cooldown var matches 1").if("data entity @s Inventory[{Slot:103b}].tag.unusual_hat").anchored("eyes").run("unusual", () => {
			for (let i = 0; i < data.unusual_effects.length; i++) {
				if (typeof data.unusual_effects[i][3] == "string") {
					mc.execute().if(`data entity @s Inventory[{Slot:103b}].tag.unusual_${data.unusual_effects[i][0]}`).run(data.unusual_effects[i][3])
				} else if (typeof data.unusual_effects[i][3] == "function") {
					mc.execute().if(`data entity @s Inventory[{Slot:103b}].tag.unusual_${data.unusual_effects[i][0]}`).run(data.unusual_effects[i][0], () => {
						data.unusual_effects[i][3]()
					})
				} else {
					mc.execute().if(`data entity @s Inventory[{Slot:103b}].tag.unusual_${data.unusual_effects[i][0]}`).run(data.unusual_effects[i][0], () => {
						util.generateRandomScore("unusual_fx", data.unusual_effects[i][3].length, data.unusual_effects[i][3])
					})
				}
			}
		})

		// got kill
		mc.execute().if("score @s strange_kills matches 1..").run("kill", () => {
			// holding strange weapon
			mc.execute().if("data entity @s SelectedItem.tag.strange_weapon").run("strange", () => {
				for (let w in data.strange_weapons) {
					mc.execute().if(`data entity @s SelectedItem.tag.strange_${data.strange_weapons[w][0]}`).run(data.strange_weapons[w][0], () => {
						// remember what the block even was
						mc.setScore("#was_air", "var", 1)
						mc.execute().if("block ~ -64 ~ bedrock").run("scoreboard players set #was_air var 0")

						// add 1 to the kills
						mc.execute().store("result score #strange_kills var").run("data get entity @s SelectedItem.tag.strange_kills")
						mc.addScore("#strange_kills", "var", 1)

						// shulker box fuckery
						mc.command("setblock ~ -64 ~ yellow_shulker_box")
						mc.command(`data modify block ~ -64 ~ Items append from entity @s SelectedItem`)
						mc.execute().store("result block ~ -64 ~ Items[0].tag.strange_kills int 1.0").run("scoreboard players get #strange_kills var")

						// format kills for name & description
						let highestLevel = data.strange_prefixes[w][data.strange_prefixes[w].length - 1]
						for (let i = 1; i <= highestLevel[0]; i++) {
							let kills = i.toLocaleString()
							let range = i
							let prefix = "Strange"
							if (i == highestLevel[0]) {
								range = i + ".."
								kills = kills + "+"
								prefix = highestLevel[1]
							} else 	{
								for (let j = 0; j < data.strange_prefixes[w].length; j++) {
									if (i < data.strange_prefixes[w][j][0]) {
										prefix = data.strange_prefixes[w][j - 1][1]
										if (i == data.strange_prefixes[w][j - 1][0])
											mc.execute().if(`score #strange_kills var matches ${i}`).run(`tellraw @a [{"selector":"@s","color":"white"},{"text":"'s ${data.strange_weapons[w][0]} has just reached a new rank: "},{"text":"${prefix}","color":"${data.color_strange}"},{"text":"!","color":"white"}]`)
										break
									}
								}
							}

							mc.execute().if(`score #strange_kills var matches ${i}`).run(`data modify block ~ -64 ~ Items[0].tag.display set value {Name:'{"text":"${prefix} ${data.strange_weapons[w][1]}","color":"${data.color_strange}","italic":false}',Lore:['{"text":"Kills: ${kills}","color":"gray","italic":false}']}`)
						}

						mc.command("item replace entity @s weapon.mainhand from block ~ -64 ~ container.0")

						// replace the block
						mc.execute().if("score #was_air var matches 0").run("setblock ~ -64 ~ bedrock")
						mc.execute().if("score #was_air var matches 1").run("setblock ~ -64 ~ air")
					})
				}
			})

			// one less kill
			mc.subtractScore("@s", "strange_kills", 1)
		})
	},
	["tick-entities-fresh-item"]: data => {
		let strange_wep_cmds = []
		for (let i = 0; i < data.strange_wep_types.length; i++) {
			for (let j = 0; j < data.strange_wep_tiers.length; j++) {
				strange_wep_cmds.push(`summon item ~ ~ ~ {Item:{id:"minecraft:${data.strange_wep_tiers[j]}_${data.strange_wep_types[i][0]}",Count:1b,tag:{display:{Name:'{"text":"Strange ${data.strange_wep_types[i][1]}","color":"${data.color_strange}","italic":false}',Lore:['{"text":"Kills: 0","color":"gray","italic":false}']},strange_weapon:1b,strange_${data.strange_wep_types[i][0]}:1b,strange_kills:0}}}`)
			}
		}

		// add bow separately
		strange_wep_cmds.push(`summon item ~ ~ ~ {Item:{id:"minecraft:bow",Count:1b,tag:{display:{Name:'{"text":"Strange Bow","color":"${data.color_strange}","italic":false}',Lore:['{"text":"Kills: 0","color":"gray","italic":false}']},strange_weapon:1b,strange_bow:1b,strange_kills:0}}}`)

		let unusual_hat_cmds = []
		for (let i = 0; i < data.unusual_types.length; i++) {
			for (let j = 0; j < data.unusual_effects.length; j++) {
				unusual_hat_cmds.push(`summon item ~ ~ ~ {Item:{id:"minecraft:${data.unusual_types[i][0]}_helmet",Count:1b,tag:{display:{Name:'{"text":"Unusual ${data.unusual_types[i][1]}","color":"${data.color_unusual}","italic":false}',Lore:['[{"text":"Effect: ","color":"gray","italic":false},{"text":"${data.unusual_effects[j][1]}","color":"${data.unusual_effects[j][2]}","italic":false}]']},unusual_hat:1b,unusual_${data.unusual_effects[j][0]}:1b,Enchantments:[{}]}}}`)
			}
		}

		// supply egg opened
		mc.execute().if("data entity @s Item.tag.supply_egg").run("supply-egg", () => {

			// 10% chance for an unusual
			mc.setScore("#got_unusual", "var", 0)
			mc.execute().percent(10).run("scoreboard players set #got_unusual var 1")

			// opening effects
			mc.command("particle block chest ~ ~ ~ 0.1 0.1 0.1 0.1 40 force")
			mc.command("particle smoke ~ ~ ~ 0.1 0.1 0.1 0.04 10 force")
			mc.command("playsound block.chest.open master @a ~ ~ ~ 1 0.8")
			mc.command("playsound entity.armor_stand.break master @a ~ ~ ~ 1 1")
			mc.command("playsound minecraft:block.iron_door.open master @a ~ ~ ~ 1 0.5")

			// common output
			mc.execute().if("score #got_unusual var matches 0").run("common", () => {
				util.generateRandomScore("supply_egg_loot", strange_wep_cmds.length, strange_wep_cmds)
			})

			// unusual output
			mc.execute().if("score #got_unusual var matches 1").run("unusual", () => {
				util.generateRandomScore("supply_egg_loot", unusual_hat_cmds.length, unusual_hat_cmds)
				mc.command("playsound entity.firework_rocket.large_blast master @a ~ ~ ~ 1 1")
				mc.command("playsound entity.firework_rocket.twinkle master @a ~ ~ ~ 1 1")
			})

			// get rid of the marker
			mc.command("kill @s")
		})
	},
	["tick-entities-fresh-trader"]: data => {
		//  give all traders supply eggs
		mc.command(`data modify entity @s Offers.Recipes prepend value {maxUses:10,buy:{id:"minecraft:emerald",Count:3b},sell:{id:"minecraft:villager_spawn_egg",Count:1b, tag:${data.supply_egg_nbt}}}`)
	}
}
