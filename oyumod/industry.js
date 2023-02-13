const mc = require("./../mcdpi")

module.exports = {
	id: "industry",
	name: "Industrial Society",
	desc: "Automation pack for vanilla Minecraft.",
	updated: [2, 11, 23],
	data: {
		slow_tick: 30,
		excavatorTypes: ["pickaxe", "shovel"],
		dyes: ["white", "orange", "magenta", "light_blue", "yellow", "lime", "pink", "gray", "light_gray", "cyan", "purple", "blue", "brown", "green", "red", "black"],
		dyeNames: ["White", "Orange", "Magenta", "Light Blue", "Yellow", "Lime", "Pink", "Gray", "Light Gray", "Cyan", "Purple", "Blue", "Brown", "Green", "Red", "Black"],
		dyeColors: [
			"16777215", // white
			"16750848", // orange
			"14483711", // magenta
			"4578047", // light blue
			"16776960", // yellow
			"7274345", // lime
			"16747767", // pink
			"7566195", // gray
			"12566463", // light gray
			"3258580", // cyan
			"10027263", // purple
			"1192447", // blue
			"9198870", // brown
			"37932", // green
			"14024704", // red
			"1842204", // black
		]
	},
	init: data => {
		mc.addTag(mc.tagType.blocks, "quarry_ignore", ["#oyumod:air", "minecraft:water", "minecraft:lava", "#minecraft:dragon_immune"])
		mc.addTag(mc.tagType.blocks, "vein_miner_pickaxe", ["minecraft:coal_ore", "minecraft:copper_ore", "minecraft:iron_ore", "minecraft:gold_ore", "minecraft:lapis_ore", "minecraft:redstone_ore", "minecraft:diamond_ore", "minecraft:emerald_ore", "minecraft:nether_gold_ore", "minecraft:nether_quartz_ore", "minecraft:deepslate_coal_ore", "minecraft:deepslate_copper_ore", "minecraft:deepslate_iron_ore", "minecraft:deepslate_gold_ore", "minecraft:deepslate_lapis_ore", "minecraft:deepslate_redstone_ore", "minecraft:deepslate_diamond_ore", "minecraft:deepslate_emerald_ore"])

		for (let i = 0; i < data.excavatorTypes.length; i++) {
			let t = data.excavatorTypes[i]
			mc.hookAdvancement(`excavate-${t}`, "item_durability_changed", {
				delta: -1, // was used on a proper block
				item: {
					nbt: `{excavator_${t}:1b}`
				}
			}, () => {
				mc.command("tag @s add special_mining")
				mc.command(`tag @s add excavator_${t}`)
				mc.command(`advancement revoke @s only industry:excavate-${t}`)
			})
		}

		mc.hookAdvancement("vein-miner", "item_durability_changed", {
			delta: -1, // was used on a proper block
			item: {
				nbt: "{vein_miner:1b}"
			}
		}, () => {
			mc.command("tag @s add special_mining")
			mc.command("tag @s add vein_miner")
			mc.command("advancement revoke @s only industry:vein-miner")
		})

		mc.hookAdvancement("treecapitator", "item_durability_changed", {
			delta: -1, // was used on a proper block
			item: {
				nbt: "{treecapitator:1b}"
			}
		}, () => {
			mc.command("tag @s add special_mining")
			mc.command("tag @s add treecapitator")
			mc.command("advancement revoke @s only industry:treecapitator")
		})
	},
	load: () => {
		mc.setScore("#industrial_tick", "var", 20)
	},
	tick: () => {
		mc.subtractScore("#industrial_tick", "var", 1)
		mc.execute().if("score #industrial_tick var matches ..0").run(`scoreboard players set #industrial_tick var 20`)

		// industrial tick happens only once a second
		mc.execute().if("score #industrial_tick var matches 1").run("industrial", () => {

			// delete stale quarry miners
			mc.execute().as("@e[type=zombie,tag=quarry_miner,tag=!quarry_miner_taken]").at("@s").run("delete-miner", () => {
				mc.command("playsound entity.item.pickup master @a ~ ~0.5 ~ 1 0.6")
				mc.command("particle cloud ~ ~0.5 ~ 0.1 0.1 0.1 0.03 8 force")
				mc.command("tp @s ~ -10 ~")
			})

			// reset miner ownership
			mc.command("tag @e[tag=quarry_miner_taken] remove quarry_miner_taken")
		})
	},
	["tick-players"]: data => {
		mc.execute().as("@s[tag=special_mining]").at("@e[type=item,tag=!been_spawned,sort=nearest,limit=1,distance=..7]").rotated("as @s").run("special-mining", () => {

			// excavator pickaxe and shovel
			for (let i = 0; i < data.excavatorTypes.length; i++) {
				let t = data.excavatorTypes[i]
				mc.execute().as(`@s[tag=excavator_${t}]`).run(`excavator-${t}`, () => {

					// excavate a 3x3x3 area
					for (let x = -1; x <= 1; x++) {
						for (let y = -1; y <= 1; y++) {
							for (let z = -1; z <= 1; z++) {
								mc.execute().positioned(mc.relativeCoords(x, y, z)).if(`block ~ ~ ~ #minecraft:mineable/${t}`).run("setblock ~ ~ ~ air destroy")
							}
						}
					}

					mc.command(`tag @s remove excavator_${t}`)
				})
			}

			// vein miner pickaxe
			mc.execute().as("@s[tag=vein_miner]").run("vein", () => {

				// recursion guard
				mc.setScore("#recur_amt", "var", 0)

				// recursive function
				mc.execute().run("r", () => {
					mc.command("setblock ~ ~ ~ air destroy")
					mc.addScore("#recur_amt", "var", 1)

					// only get adjacent blocks
					for (const i of [1, -1]) {
						mc.execute().if("score #recur_amt var matches ..80").positioned(mc.relativeCoords(i, 0, 0)).if("block ~ ~ ~ #industry:vein_miner_pickaxe").recurse()
						mc.execute().if("score #recur_amt var matches ..80").positioned(mc.relativeCoords(0, i, 0)).if("block ~ ~ ~ #industry:vein_miner_pickaxe").recurse()
						mc.execute().if("score #recur_amt var matches ..80").positioned(mc.relativeCoords(0, 0, i)).if("block ~ ~ ~ #industry:vein_miner_pickaxe").recurse()
					}
				})

				mc.command("tag @s remove vein_miner")
			})

			// treecapitator axe
			mc.execute().as("@s[tag=treecapitator]").run("treecap", () => {

				// recursion guard
				mc.setScore("#recur_amt", "var", 0)

				// recursive function
				mc.execute().run("r", () => {
					mc.command("setblock ~ ~ ~ air destroy")
					mc.addScore("#recur_amt", "var", 1)

					// reach those pesky branches connected by a diagonal
					for (let x = -1; x <= 1; x++) {
						for (let y = -1; y <= 1; y++) {
							for (let z = -1; z <= 1; z++) {
								if (x == 0 && y == 0 && z == 0)
									continue

								mc.execute().if("score #recur_amt var matches ..80").positioned(mc.relativeCoords(x, y, z)).if(`block ~ ~ ~ #minecraft:logs`).recurse()
							}
						}
					}
				})

				mc.command("tag @s remove treecapitator")
			})

			mc.command("tag @s remove special_mining")
		})
	},
	["tick-entities"]: data => {
		mc.execute().if("score #industrial_tick var matches 1").run("industrial", () => {
			mc.execute().as("@s[type=item_frame]").run("frame", () => {
				mc.setScore("#machine_done", "var", 0)

				// quarry
				mc.execute().as(`@s[nbt={Item:{id:"minecraft:diamond_pickaxe"}}]`).positioned(mc.relativeCoords(0, -1, 0)).if("block ~ ~ ~ blast_furnace").run("quarry", () => {
					mc.command(`data merge block ~ ~ ~ {CustomName:"{\\"text\\":\\"Quarry\\",\\"bold\\":true,\\"color\\":\\"gray\\"}"}`)
					mc.setScore("#machine_done", "var", 1)
					for (let i = 0; i < 4; i++)
						mc.command(`particle happy_villager ~${Math.floor(i / 2).toFixed(0) * 6 + 0.5} ~1 ~${(i % 2).toFixed(0) * 6 + 0.5} 0 0 0 0 1`)
					mc.setScore("#quarry_depth", "var", 0)
					mc.setScore("#quarry_succ", "var", 0)
					mc.execute().positioned(mc.relativeCoords(1, 0, 1)).run("r", () => {
/*
						// old recursive method
						mc.setScore("#quarry_y", "var", 0)
						mc.execute().run("y", () => {
							mc.addScore("#quarry_y", "var", 1)
							mc.setScore("#quarry_x", "var", 0)
							mc.execute().if("score #quarry_y var matches ..5").positioned(mc.relativeCoords()).run("x", () => {
								mc.addScore("#quarry_x", "var", 1)
								mc.setScore("#quarry_succ", "var", 0)
								mc.execute().unless("block ~ ~ ~ #oyumod:quarry_ignore").run("break", () => {
									mc.command("setblock ~ ~ ~ air destroy")
									mc.command("tag @e[type=item,distance=..1] add quarry_collect")
									mc.setScore("#quarry_succ", "var", 1)

									// quarry miner npcs
									const miner_target = "@e[type=zombie,tag=quarry_miner,tag=!quarry_miner_taken,sort=nearest,limit=1]"
									mc.setScore("#quarry_miner_found", "var", 0)
									mc.execute().if(`entity ${miner_target}`).run("tp", () => {
										mc.command(`teleport ${miner_target} ~ ~ ~ 90 0`)
										mc.command(`tag ${miner_target} add quarry_miner_taken`)
										mc.setScore("#quarry_miner_found", "var", 1)
									})
									mc.execute().if("score #quarry_miner_found var matches 0").run("newminer", () => {
										mc.command(`summon zombie ~ ~ ~ {Silent:1b,Invulnerable:1b,PersistenceRequired:1b,NoAI:1b,IsBaby:1b,Tags:["quarry_miner","quarry_miner_taken"],CustomName:'{"text":"Quarry Miner","color":"white","italic":false}',HandItems:[{id:"minecraft:iron_pickaxe",Count:1b},{}],HandDropChances:[0.000F,0.085F],ArmorItems:[{},{},{},{id:"minecraft:golden_helmet",Count:1b}],ArmorDropChances:[0.085F,0.085F,0.085F,0.000F]}`)
									})
								})
								mc.execute().if("score #quarry_succ var matches 0").if("score #quarry_x var matches ..4").positioned(mc.relativeCoords(1, 0, 0)).recurse()
								mc.execute().if("score #quarry_succ var matches 0").unless("score #quarry_x var matches ..4").if("score #quarry_x var matches 4..").positioned(mc.relativeCoords(-4, 0, 1)).run("function oyumod:tick-entities-industrial-frame-quarry-r-y")
							})
							mc.addScore("#quarry_depth", "var", 1)
							mc.execute().unless("score #quarry_y var matches ..5").unless("score #quarry_depth var matches 21..").positioned(mc.relativeCoords(0, -1, -5)).run("function oyumod:tick-entities-industrial-frame-quarry-r")
						})
*/
						// new, faster method

						// always try by default
						mc.setScore("#quarry_try", "var", 1)

						// if this level is the same as the one on top of it, skip it
						// BUT if we're on the very first level, don't ever skip
						mc.execute().unless("score #quarry_depth var matches 0").if("blocks ~ ~ ~ ~5 ~ ~5 ~ ~1 ~ all").run("scoreboard players set #quarry_try var 0")

						// try this 5x5 area
						mc.execute().if("score #quarry_try var matches 1").run("try", () => {

							// do each block manually to cut back on function calls
							for (let x = 0; x <= 5; x++) {
								for (let z = 0; z <= 5; z++) {
									mc.execute().if("score #quarry_succ var matches 0").positioned(mc.relativeCoords(x, 0, z)).unless("block ~ ~ ~ #industry:quarry_ignore").run("break", () => {

										// tag that we found a block
										mc.setScore("#quarry_succ", "var", 1)

										// destroy and collect the block we found
										mc.command("setblock ~ ~ ~ air destroy")
										mc.command("tag @e[type=item,distance=..1] add quarry_collect")

										// quarry miner npcs
										const miner_target = "@e[type=zombie,tag=quarry_miner,tag=!quarry_miner_taken,sort=nearest,limit=1]"
										mc.setScore("#quarry_miner_found", "var", 0)
										mc.execute().if(`entity ${miner_target}`).run("tp", () => {
											mc.command(`teleport ${miner_target} ~ ~ ~ 90 0`)
											mc.command(`tag ${miner_target} add quarry_miner_taken`)
											mc.setScore("#quarry_miner_found", "var", 1)
										})

										// summon a new miner if we can't find one
										mc.execute().if("score #quarry_miner_found var matches 0").run("newminer", () => {
											mc.command(`summon zombie ~ ~ ~ {Silent:1b,Invulnerable:1b,PersistenceRequired:1b,NoAI:1b,IsBaby:1b,Tags:["quarry_miner","quarry_miner_taken"],CustomName:'{"text":"Quarry Miner","color":"white","italic":false}',HandItems:[{id:"minecraft:iron_pickaxe",Count:1b},{}],HandDropChances:[0.000F,0.085F],ArmorItems:[{},{},{},{id:"minecraft:golden_helmet",Count:1b}],ArmorDropChances:[0.085F,0.085F,0.085F,0.000F]}`)
										})
									})
								}
							}
						})

						// add 1 to our depth meter
						mc.addScore("#quarry_depth", "var", 1)

						// try the next level down
						mc.execute().if("score #quarry_succ var matches 0").if("score #quarry_depth var matches ..20").positioned(mc.relativeCoords(0, -1, 0)).recurse()
					})

					// if we managed to break a block
					mc.execute().if("score #quarry_succ var matches 1").run("succ", () => {

						// move product up to quarry
						mc.command("teleport @e[type=item,tag=quarry_collect] ~-1 ~1 ~-1")
						mc.command("tag @e[tag=quarry_collect] remove quarry_collect")

						// store durability and subtract 3
						mc.execute().store("result score #quarry_durability var").run("data get entity @e[type=item_frame,sort=nearest,limit=1] Item.tag.Damage")
						mc.addScore("#quarry_durability", "var", 3)

						// diamond tool dead
						mc.execute().if("score #quarry_durability var matches 1561..").at("@s").run("break", () => {
							mc.command(`data merge entity @s {Item:{id:""}}`)
							mc.command("particle item diamond_pickaxe ~ ~ ~ 0 0 0 0.05 20 force")
							mc.command("playsound entity.item.break master @a ~ ~ ~ 1 0.8")
						})

						// not dead just hurt
						mc.execute().if("score #quarry_durability var matches ..1560").store("result entity @s Item.tag.Damage int 1").run("scoreboard players get #quarry_durability var")
					})

					mc.setScore("#machine_done", "var", 1)
				})

				// pump
				mc.execute().if("score #machine_done var matches 0").as(`@s[nbt={Item:{id:"minecraft:bucket"}}]`).positioned(mc.relativeCoords(0, -1, 0)).if("block ~ ~ ~ blast_furnace").run("pump", () => {
					mc.setScore("#machine_done", "var", 1)
				})

				// crafter
				mc.execute().if("score #machine_done var matches 0").as(`@s[nbt={Item:{id:"minecraft:crafting_table"}}]`).positioned(mc.relativeCoords(0, -1, 0)).if("block ~ ~ ~ dropper").run("craft", () => {
					mc.setScore("#crafting_succ", "var", 0)

					// craft item receiver
					mc.execute().if(`data block ~ ~ ~ Items[{Slot:1b,Count:1b,id:"minecraft:hopper"}]`).run("receiver", () => {
						for (let i = 0; i < data.dyes.length; i++) {
							mc.execute().if(`data block ~ ~ ~ Items[{Slot:4b,Count:1b,id:"minecraft:${data.dyes[i]}_dye"}]`).run(i + 1, () => {
								mc.command(`data modify block ~ ~ ~ Items[{Slot:1b}] set value {Slot:1b}`)
								mc.command(`data modify block ~ ~ ~ Items[{Slot:4b}] set value {Slot:4b,Count:1b,id:"minecraft:firework_star",tag:{HideFlags:32,item_receiver:${i + 1}b,display:{Name:'{"text":"Item Receiver (${data.dyeNames[i]})","italic":false}'},Explosion:{Type:0,Colors:[I;${data.dyeColors[i]}]},Enchantments:[{}]}}`)
								mc.setScore("#crafting_succ", "var", 1)
							})
						}
					})

					// craft item transmitter
					mc.execute().if("score #crafting_succ var matches 0").if(`data block ~ ~ ~ Items[{Slot:7b,Count:1b,id:"minecraft:hopper"}]`).run("transmitter", () => {
						for (let i = 0; i < data.dyes.length; i++) {
							mc.execute().if(`data block ~ ~ ~ Items[{Slot:4b,Count:1b,id:"minecraft:${data.dyes[i]}_dye"}]`).run(i + 1, () => {
								mc.command(`data modify block ~ ~ ~ Items[{Slot:7b}] set value {Slot:7b}`)
								mc.command(`data modify block ~ ~ ~ Items[{Slot:4b}] set value {Slot:4b,Count:1b,id:"minecraft:firework_star",tag:{HideFlags:32,item_transmitter:${i + 1}b,display:{Name:'{"text":"Item Transmitter (${data.dyeNames[i]})","italic":false}'},Explosion:{Type:0,Colors:[I;${data.dyeColors[i]}]},Enchantments:[{}]}}`)
								mc.setScore("#crafting_succ", "var", 1)
							})
						}
					})

					// switch transmitter or receiver
					mc.execute().if("score #crafting_succ var matches 0").if(`data block ~ ~ ~ Items[{Slot:7b,Count:1b,id:"minecraft:redstone_torch"}]`).run("switch", () => {
						// switch from transmitter to receiver
						mc.execute().if("score #crafting_succ var matches 0").if(`data block ~ ~ ~ Items[{Slot:4b}].tag.item_receiver`).run("rec-to-trans", () => {
							for (let i = 0; i < data.dyes.length; i++)
							{
								mc.execute().if(`data block ~ ~ ~ Items[{Slot:4b,tag:{item_receiver:${i + 1}b}}]`).run(i + 1, () => {
								mc.command(`data modify block ~ ~ ~ Items[{Slot:7b}] set value {Slot:7b}`)
									mc.command(`data modify block ~ ~ ~ Items[{Slot:4b}] set value {Slot:4b,Count:1b,id:"minecraft:firework_star",tag:{HideFlags:32,item_transmitter:${i + 1}b,display:{Name:'{"text":"Item Transmitter (${data.dyeNames[i]})","italic":false}'},Explosion:{Type:0,Colors:[I;${data.dyeColors[i]}]},Enchantments:[{}]}}`)
									mc.setScore("#crafting_succ", "var", 1)
								})
							}
						})

						// switch from receiver to transmitter
						mc.execute().if("score #crafting_succ var matches 0").if(`data block ~ ~ ~ Items[{Slot:4b}].tag.item_transmitter`).run("trans-to-rec", () => {
							for (let i = 0; i < data.dyes.length; i++)
							{
								mc.execute().if(`data block ~ ~ ~ Items[{Slot:4b,tag:{item_transmitter:${i + 1}b}}]`).run(i + 1, () => {
								mc.command(`data modify block ~ ~ ~ Items[{Slot:7b}] set value {Slot:7b}`)
									mc.command(`data modify block ~ ~ ~ Items[{Slot:4b}] set value {Slot:4b,Count:1b,id:"minecraft:firework_star",tag:{HideFlags:32,item_receiver:${i + 1}b,display:{Name:'{"text":"Item Receiver (${data.dyeNames[i]})","italic":false}'},Explosion:{Type:0,Colors:[I;${data.dyeColors[i]}]},Enchantments:[{}]}}`)
									mc.setScore("#crafting_succ", "var", 1)
								})
							}
						})
					})

					mc.execute().if("score #crafting_succ var matches 1").run("playsound block.anvil.use master @a ~ ~ ~ 1 2")
				})

				// colored item transmitters
				mc.execute().if("score #machine_done var matches 0").if("data entity @s Item.tag.item_transmitter").if("entity @e[type=item,sort=nearest,limit=1,distance=..2]").run("transmit", () => {
					mc.execute().store("result score #transmit_color var").run("data get entity @s Item.tag.item_transmitter")
					for (let i = 0; i < data.dyes.length; i++) {
						let rec = `@e[type=item_frame,sort=nearest,limit=1,distance=..50,nbt={Item:{tag:{item_receiver:${i + 1}b}}}]`
						mc.execute().if(`score #transmit_color var matches ${i + 1}`).if(`entity ${rec}`).as("@e[type=item,distance=..2]").at(rec).run(`tp @s ~ ~0.2 ~`)
					}
				})
			})
		})
	}
}
