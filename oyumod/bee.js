const mc = require("./../mcdpi")
const util = require("./util")

module.exports = { // beekeeping
	id: "beekeeping",
	name: "Beekeeping",
	updated: [2, 11, 23],
	desc: "Clone of Forestry bees from FtB. Can you solve the beenome?",
	data: {
		// Genetics.Genotype stores alleles
		// Genetics.AlleleSource stores where they came from (0 = mother, 1 = father, 2 = mutation)
		// Genetics.Phenotypes store [Group, Tier]
		bee_egg_nbt: `{id:"minecraft:bee_spawn_egg",Count:1b,tag:{display:{Name:'{"text":"Scooped Bee","color":"gold","italic":false}',Lore:['[{"text":"Genotype: ","color":"gray","italic":false},{"text":"Pending analysis","color":"gray","italic":true}]','[{"text":"Phenotype: ","color":"gray","italic":false},{"text":"Pending analysis","color":"gray","italic":true}]','[{"text":"Byproduct: ","color":"gray","italic":false},{"text":"Pending analysis","color":"gray","italic":true}]']},bee_egg:1b,Genetics:{Genotype:[0,0,0,0],AlleleSources:[0,0,0,0],Phenotypes:[0,0]},Enchantments:[{}],EntityTag:{HandItems:[{id:"minecraft:bee_spawn_egg",Count:1b},{}]}}}`,

		centrifuge_core_tag: `{display:{Name:'{"text":"Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Place in an item frame on top","color":"gray","italic":false}','{"text":"of a smoker to make a centrifuge.","color":"gray","italic":false}']},HideFlags:32,centrifuge_core:1b,CustomModelData:12490001,Explosion:{Type:0}}`,
		centrifuge_core_worn_tag: `{display:{Name:'{"text":"Worn-Out Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Can be repaired with Bee Glue.","color":"gray","italic":false}']},HideFlags:32,worn_out_centrifuge_core:1b,CustomModelData:12490002,Explosion:{Type:0}}`,

		bee_groups: [
			{
				name: "Alpha",
				allele: "A",
				color: "#ff6d33",
				products: [
					["dirt", "Dirt", "#7A5515", "Earthy", "brown_dye"],
					["feather", "Feathers", "#e6e6e6", "Fluffy", "white_dye"],
					["wheat", "Wheat", "#c9b24b", "Fibrous", "yellow_dye"],
					["leather", "Leather", "#cc9200", "Leathery", "brown_dye"]
				]
			}, {
				name: "Beta",
				allele: "B",
				color: "#3b71f7",
				products: [
					["sugar", "Sugar", "#e6e6e6", "Sweet", "light_gray_dye"],
					["cocoa_beans", "Cocoa beans", "#a68a02", "Chocolatey", "brown_dye"],
					["bone_meal", "Bone meal", "#e6e6e6", "Fertile", "white_dye"],
					["slime_ball", "Slime", "#8aff78", "Sticky", "lime_dye"]
				]
			}, {
				name: "Gamma",
				allele: "G",
				color: "#6af73b",
				products: [
					["potato", "Potatoes", "#b89d4f", "Starchy", "brown_dye"],
					["carrot", "Carrots", "#ffaa00", "Crunchy", "orange_dye"],
					["apple", "Apples", "#ff0000", "Tart", "red_dye"],
					["golden_carrot", "Golden carrots", "#ffd900", "Glistening", "yellow_dye"]
				]
			}, {
				name: "Delta",
				allele: "D",
				color: "#d65cff",
				products: [
					["clay_ball", "Clay", "#59687A", "Malleable", "light_gray_dye"],
					["flint", "Flint", "#5e5e5e", "Sharp", "gray_dye"],
					["charcoal", "Charcoal", "#706b65", "Charred", "black_dye"],
					["gunpowder", "Gunpowder", "#a3a3a3", "Powdery", "gray_dye"]
				]
			}, {
				name: "Epsilon",
				allele: "E",
				color: "#3bf7e1",
				products: [
					["raw_copper", "Copper", "#a37000", "Oxidized", "green_dye"],
					["raw_iron", "Iron", "#c7c7c7", "Galvanized", "gray_dye"],
					["raw_gold", "Gold", "#ffd000", "Golden", "yellow_dye"],
					["experience_bottle", "C.M.I. Fluid", "#00e5ff", "Pristine", "cyan_dye"]
				]
			}, {
				name: "Ligma",
				allele: "L",
				color: "#7a0074",
				products: [
					["quartz", "Nether quartz", "#e3d3d4", "Marbled", "white_dye"],
					["blaze_powder", "Blaze powder", "#ffa436", "Smoldering", "orange_dye"],
					["ender_pearl", "Ender pearls", "#2e8740", "Ender", "green_dye"],
					["enchanted_golden_apple", "Enchanted golden apples", "#ee9ffc", "Enchanted", "magenta_dye"]
				]
			}, {
				name: "Yukon",
				allele: "Y",
				color: "#005d85",
				products: [
					["golden_apple", "Golden apples", "#edd353", "Healing", "yellow_dye"],
					["emerald", "Emeralds", "#4dff58", "Enchanted", "lime_dye"],
					["diamond", "Diamonds", "#94fbff", "Sparkling", "light_blue_dye"],
					["netherite_scrap", "Netherite scrap", "#9c3205", "Ancient", "brown_dye"]
				]
			}
		],

		bee_tiers: [
			["X", "#ff9494"],
			["Y", "#fffb80"],
			["Z", "#80ff9c"],
			["W", "#73ecff"]
		]
	},
	init: data => {
		mc.hookAdvancement("harvest-honey-comb", "item_used_on_block", {
			location: {block: {tag: "minecraft:beehives"}},
			item: {nbt: "{bee_shears:1b}"}
		}, () => {
			mc.command("advancement revoke @s only beekeeping:harvest-honey-comb")
			mc.setScore("#max_recursion", "var", 0)
			mc.execute().anchored("eyes").run("loop", () => {
				mc.execute().positioned("^ ^ ^0.02").if("block ~ ~ ~ #minecraft:beehives").run("harvest", () => {
					// check if there are bees in the hive block
					mc.execute().store("success score #bees_in_hive var").run("data get block ~ ~ ~ Bees[0]")

					// check if there are bees flying around
					mc.setScore("#bees_flying_around", "var", 0)
					mc.execute().if("entity @e[type=bee,sort=nearest,distance=..20,limit=1]").run("scoreboard players set #bees_flying_around var 1")

					// if we could use either, choose randomly between them
					mc.execute().if("score #bees_in_hive var matches 1").if("score #bees_flying_around var matches 1").run("either", () => {
						mc.setScore("#use_flying_bees", "var", 1)
						mc.execute().percent(50).run("scoreboard players set #use_flying_bees var 0")
					})
 
					// if we could only use one, make sure we use it
					mc.execute().if("score #bees_in_hive var matches 1").if("score #bees_flying_around var matches 0").run("scoreboard players set #use_flying_bees var 0")
					mc.execute().if("score #bees_in_hive var matches 0").if("score #bees_flying_around var matches 1").run("scoreboard players set #use_flying_bees var 1")

					// d.r.y. solution
					mc.setScore("#can_bee_prod", "var", 0)
					mc.execute().if("score #bees_in_hive var matches 1").run("scoreboard players set #can_bee_prod var 1")
					mc.execute().if("score #can_bee_prod var matches 0").if("score #bees_flying_around var matches 1").run("scoreboard players set #can_bee_prod var 1")
	
					// if we could find any bees, do some production
					mc.execute().if("score #can_bee_prod var matches 1").run("prod", () => {

						// produce from bees in hive
						mc.execute().if("score #use_flying_bees var matches 0").run("hive", () => {

							// get the amount of bees in the hive
							mc.execute().store("result score #bees_in_hive_amt var").run("data get block ~ ~ ~ Bees")

							// randomly set the value of the bee used for production
							mc.setScore("#prod_bee_index", "var", 0)
							for (let i = 0; i < 8; i++)
								mc.execute().percent(50).run(`scoreboard players add #prod_bee_index var ${Math.pow(2, i)}`)

							// make sure its a valid index in the blocks Bee array
							mc.command("scoreboard players operation #prod_bee_index var %= #bees_in_hive_amt var")

							// get the phenotypes from our chosen bee
							// only up to three bees can fit in a hive at once
							for (let i = 0; i < 3; i++)
							{
								mc.execute().if(`score #prod_bee_index var matches ${i}`).run(i, () => {
									// group
									for (let j = 0; j < 7; j++)
										mc.execute().as(`@s[tag=bee_group_${j + 1}]`).run(`scoreboard players set #bee_prod_group var ${j + 1}`)

									// tiers
									for (let j = 0; j < 4; j++)
										mc.execute().as(`@s[tag=bee_tier_${j + 1}]`).run(`scoreboard players set #bee_prod_tier var ${j + 1}`)
								})
							}
						})

						// produce from roaming bees
						mc.execute().if("score #use_flying_bees var matches 1").as("@e[type=bee,distance=..21,limit=1,sort=random]").run("roaming", () => {
							mc.execute().store(`result score #bee_prod_group var`).run(`data get entity @s HandItems[0].tag.Genetics.Phenotypes[0]`)
							mc.execute().store(`result score #bee_prod_tier var`).run(`data get entity @s HandItems[0].tag.Genetics.Phenotypes[1]`)
						})

						// create product depending on phenotype
						for (let i = 0; i < 7; i++) {
							for (let j = 0; j < 4; j++) {
								// mc.execute().if(`score #bee_prod_group var matches ${i + 1}`).if(`score #bee_prod_tier var matches ${j + 1}`).at('@e[limit=1,sort=nearest,nbt={Item:{id:"minecraft:honeycomb"}}]').run(`summon item ~ ~ ~ {Item:{id:"minecraft:${data.bee_groups[i].products[j]}",Count:1b}}`)
								// mc.execute().if(`score #bee_prod_group var matches ${i + 1}`).if(`score #bee_prod_tier var matches ${j + 1}`).run(`summon item ~ ~ ~ {Item:{id:"minecraft:${data.bee_groups[i].products[j]}",Count:1b}}`)
								let product = data.bee_groups[i].products[j]
								let product_id = product[0]
								let product_name = product[1]
								let comb_color = product[2]
								let comb_adj = product[3]
								let comb_dye = product[4]

								mc.execute().if(`score #bee_prod_group var matches ${i + 1}`).if(`score #bee_prod_tier var matches ${j + 1}`).run(`summon item ~ ~ ~ {Item:{id:"minecraft:honeycomb",Count:1b,tag:{display:{Name:'{"text":"${comb_adj} Comb","color":"${comb_color}","italic":false}',Lore:['[{"text":"Can be centrifuged to extract ","color":"gray","italic":false},{"text":"${product_name}","color":"${comb_color}","italic":false},{"text":".","color":"gray","italic":false}]']},special_comb:1b,comb_${product_id}:1b,CustomModelData:${12490000 + i * 4 + j}}}}`)
							}
						}
					})
				})
				mc.execute().positioned("^ ^ ^0.02").unless("block ~ ~ ~ #minecraft:beehives").unless("score #max_recursion var matches 500..").recurse()
				mc.addScore("#max_recursion", "var", 1)
			})
		})
	},
	load: () => {
		mc.setScore("#beealyzer_cooldown", "var", 10)
		mc.setScore("#centrifuge_cooldown", "var", 100)
	},
	tick: () => {
		mc.subtractScore("#beealyzer_cooldown", "var", 1)
		mc.execute().if("score #beealyzer_cooldown var matches ..0").run("scoreboard players set #beealyzer_cooldown var 10")
		mc.subtractScore("#centrifuge_cooldown", "var", 1)
		mc.execute().if("score #centrifuge_cooldown var matches ..0").run("scoreboard players set #centrifuge_cooldown var 100")
	},
	["tick-entities-fresh-item"]: data => {

		// make sure bee eggs preserve genetics
		mc.execute().if("data entity @s Item.tag.bee_egg").run("bee-egg", () => {
			mc.command(`data modify entity @s Item.tag.EntityTag.HandItems[0] set value ${data.bee_egg_nbt}`)
			mc.command(`data modify entity @s Item.tag.EntityTag.HandItems[0].tag.Genetics set from entity @s Item.tag.Genetics`)
		})

/*
		// fresh combs can contain special bee by-products
		mc.execute().as('@s[nbt={Item:{id:"minecraft:honeycomb"}}]').unless("data entity @s Item.tag.stale_comb").run("comb", () => {

			let bee_byproduct_cmds = []
			// make product dependent on phenotype
			for (let i = 0; i < bee_products.length; i++)
			{
				for (let j = 0; j < bee_products[i].length; j++)
				{
					// CMI fluid special case
					if (i == 4 && j == 3)
					{
						mc.execute().if(`score #bee_group var matches ${i + 1}`).if(`score #bee_tier var matches ${j + 1}`).run(`data modify entity ${nearest_empty_frame} Item set value {id:"minecraft:experience_bottle",Count:1b,tag:{cmi_fluid:1b,display:{Name:'{"text":"C.M.I. Fluid","color":"dark_aqua","bold":true,"italic":false}',Lore:['{"text":"Can be used to artificially breed","color":"gray","italic":false}','{"text":"genetically superior bees.","color":"gray","italic":false}']}}}`)
					}
					else
					{
						mc.execute().if(`score #bee_group var matches ${i + 1}`).if(`score #bee_tier var matches ${j + 1}`).run(`data modify entity ${nearest_empty_frame} Item set value {id:"minecraft:${bee_products[i][j][0]}",Count:1b}`)
					}
				}
			}
		})
*/
	},
	["tick-entities"]: data => {

		// bee tick
		mc.execute().as("@s[type=bee]").run("bee", () => {

			// bees that exit hives lose their HandItems, but not their tags
			mc.execute().as("@s[tag=bee_setup]").unless("data entity @s HandItems[0].tag.Genetics").run("exit-hive", () => {

				// setup nbt structure
				mc.command(`data merge entity @s {HandItems:[${data.bee_egg_nbt},{}]}`)

				// move alleles and allele sources from tags to scoreboard
				for (let i = 0; i < 4; i++)
				{
					// alleles
					for (let j = 0, jm = i < 2 ? 7 : 4; j < jm; j++)
						mc.execute().as(`@s[tag=bee_allele_${i}_${j + 1}]`).run(`data modify entity @s HandItems[0].tag.Genetics.Genotype[${i}] set value ${j + 1}`)

					// allele sources
					for (let j = 0; j < 3; j++)
						mc.execute().as(`@s[tag=bee_allele_src_${i}_${j + 1}]`).run(`data modify entity @s HandItems[0].tag.Genetics.AlleleSources[${i}] set value ${j + 1}`)
				}

				// move phenotypes from tags to scoreboard
				// group
				for (let i = 0; i < 7; i++)
					mc.execute().as(`@s[tag=bee_group_${i + 1}]`).run(`data modify entity @s HandItems[0].tag.Genetics.Phenotypes[0] set value ${i + 1}`)

				// tiers
				for (let i = 0; i < 4; i++)
					mc.execute().as(`@s[tag=bee_tier_${i + 1}]`).run(`data modify entity @s HandItems[0].tag.Genetics.Phenotypes[1] set value ${i + 1}`)

				// run setup again to do the generation stuff
				mc.command("tag @s remove bee_setup")
			})

			// fresh bees
			mc.execute().as("@s[tag=!bee_setup]").run("fresh", () => {

				// reset custom name so they aren't named "Scooped Bee" if scooped and placed down
				mc.command(`data merge entity @s {CustomName:''}`)

				// if this bee wasn't scooped, initialize this bee's genes
				mc.execute().unless(`data entity @s HandItems[0].tag.Genetics`).run("genes", () => {

					// set the nbt structure
					mc.command(`data merge entity @s {HandItems:[${data.bee_egg_nbt},{}]}`)

					// initial dummy phenotypes
					// smaller numbers are more dominant
					mc.setScore("#bee_group", "var", 999)
					mc.setScore("#bee_tier", "var", 999)

					// try to find this bee's parents
					mc.setScore("#bee_found_parents", "var", 0)
					mc.command("tag @e[type=bee,tag=bee_parent,sort=nearest,limit=1,distance=..8] add bee_mom")
					mc.execute().if("entity @e[type=bee,limit=1,tag=bee_mom]").run("tag @e[type=bee,tag=bee_parent,tag=!bee_mom,sort=nearest,limit=1,distance=..8] add bee_dad")
					mc.execute().if("entity @e[type=bee,limit=1,tag=bee_mom]").if("entity @e[type=bee,limit=1,tag=bee_dad]").run("scoreboard players set #bee_found_parents var 1")

					// mom & dad are no longer horny
					mc.execute().if("score #bee_found_parents var matches 1").run(`parents`, () => {
						mc.command("tag @e[type=bee,limit=1,tag=bee_mom] remove bee_parent")
						mc.command("tag @e[type=bee,limit=1,tag=bee_dad] remove bee_parent")
					})

					// generate this bee's genotype
					for (let i = 0; i < 4; i++)
					{

						// default is maternal allele
						mc.setScore("#bee_allele_source", "var", 0)

						// 50% chance to be a paternal allele
						mc.execute().percent(50).run("scoreboard players set #bee_allele_source var 1")

						// 8% chance to be a random mutation
						mc.execute().percent(8).run("scoreboard players set #bee_allele_source var 2")

						// determine how we should assign this bee's alleles
						mc.setScore("#bee_mutate", "var", 1)
						mc.execute().if("score #bee_found_parents var matches 1").if("score #bee_allele_source var matches ..1").run("scoreboard players set #bee_mutate var 0")

						// non-mutative behavior, take an allele from our parents
						mc.execute().if("score #bee_mutate var matches 0").run(`parents-${i}`, () => {

							// copy genes from mom or dad
							mc.execute().if("score #bee_allele_source var matches 0").store(`result score #bee_allele var`).run(`data get entity @e[type=bee,limit=1,tag=bee_mom] HandItems[0].tag.Genetics.Genotype[${i}]`)
							mc.execute().if("score #bee_allele_source var matches 1").store(`result score #bee_allele var`).run(`data get entity @e[type=bee,limit=1,tag=bee_dad] HandItems[0].tag.Genetics.Genotype[${i}]`)
						})

						// mutative behavior, generate a completely random allele
						mc.execute().if("score #bee_mutate var matches 1").run(`orphan-${i}`, () => {

							// unweighted random
							util.generateRandomScore("bee_allele", i < 2 ? 5 : 4)
							mc.addScore("#bee_allele", "var", 1)
						})

						// store allele in NBT
						mc.execute().store(`result entity @s HandItems[0].tag.Genetics.Genotype[${i}] int 1`).run("scoreboard players get #bee_allele var")

						// store parent in NBT
						mc.execute().store(`result entity @s HandItems[0].tag.Genetics.AlleleSources[${i}] int 1`).run("scoreboard players get #bee_allele_source var")

						// set the most dominant allele to control out phenotype
						const phenotype = i < 2 ? "group" : "tier"
						mc.execute().if(`score #bee_${phenotype} var > #bee_allele var`).store(`result score #bee_${phenotype} var`).run(`scoreboard players get #bee_allele var`)
					}

					// store phenotypes in NBT
					mc.execute().store(`result entity @s HandItems[0].tag.Genetics.Phenotypes[0] int 1`).run("scoreboard players get #bee_group var")
					mc.execute().store(`result entity @s HandItems[0].tag.Genetics.Phenotypes[1] int 1`).run("scoreboard players get #bee_tier var")

					// clear tags used to move genes
					mc.command("tag @e[tag=bee_mom] remove bee_mom")
					mc.command("tag @e[tag=bee_dad] remove bee_dad")
				})

				// add tags for the bees genotype and allele sources
				for (let i = 0; i < 4; i++)
				{
					// move data from nbt to scoreboard
					mc.execute().store(`result score #bee_allele var`).run(`data get entity @s HandItems[0].tag.Genetics.Genotype[${i}]`)
					mc.execute().store(`result score #bee_allele_source var`).run(`data get entity @s HandItems[0].tag.Genetics.AlleleSources[${i}]`)

					// add a tag for this allele
					for (let j = 0, jm = i < 2 ? 7 : 4; j < jm; j++)
						mc.execute().if(`score #bee_allele var matches ${j + 1}`).run(`tag @s add bee_allele_${i}_${j + 1}`)

					// add a tag for this allele's source
					for (let j = 0; j < 3; j++)
						mc.execute().if(`score #bee_allele_source var matches ${j}`).run(`tag @s add bee_allele_src_${i}_${j}`)
				}

				// get phenotype data from nbt into scoreboard
				mc.execute().store(`result score #bee_group var`).run(`data get entity @s HandItems[0].tag.Genetics.Phenotypes[0]`)
				mc.execute().store(`result score #bee_tier var`).run(`data get entity @s HandItems[0].tag.Genetics.Phenotypes[1]`)

				// add tags for the bee's phenotypes
				for (let i = 0; i < 7; i++)
					mc.execute().if(`score #bee_group var matches ${i + 1}`).run(`tag @s add bee_group_${i + 1}`)
				for (let i = 0; i < 4; i++)
					mc.execute().if(`score #bee_tier var matches ${i + 1}`).run(`tag @s add bee_tier_${i + 1}`)

				// write genetic data to description of bee's dropped egg
				mc.execute().as("@s[tag=bee_analyzed]").run("anal", () => {
					let i = []
					for (i[0] = 0; i[0] < 7; i[0]++) 	{
						for (i[1] = 0; i[1] < 7; i[1]++) {
							for (i[2] = 0; i[2] < 4; i[2]++) {
								for (i[3] = 0; i[3] < 4; i[3]++) {
									let group = Math.min(i[0], i[1])
									let tier = Math.min(i[2], i[3])
									mc.execute().as(`@s[tag=bee_allele_0_${i[0] + 1},tag=bee_allele_1_${i[1] + 1},tag=bee_allele_2_${i[2] + 1},tag=bee_allele_3_${i[3] + 1}]`).run(`data modify entity @s HandItems[0].tag.display.Lore set value ['[{"text":"Genotype: ","color":"gray","italic":false},{"text":"${data.bee_groups[i[0]].allele}","color":"${data.bee_groups[i[0]].color}","italic":false},{"text":"${data.bee_groups[i[1]].allele}","color":"${data.bee_groups[i[1]].color}","italic":false},{"text":"${data.bee_tiers[i[2]][0]}","color":"${data.bee_tiers[i[2]][1]}","italic":false},{"text":"${data.bee_tiers[i[3]][0]}","color":"${data.bee_tiers[i[3]][1]}","italic":false}]','[{"text":"Phenotype: ","color":"gray","italic":false},{"text":"${data.bee_groups[group].name}","color":"${data.bee_groups[group].color}","italic":false},{"text":"-","color":"gray","italic":false},{"text":"${tier + 1}","color":"${data.bee_tiers[tier][1]}","italic":false}]','[{"text":"Byproduct: ","color":"gray","italic":false},{"text":"${data.bee_groups[group].products[tier][1]}","color":"${data.bee_groups[group].products[tier][2]}","italic":false}]']`)
								}
							}
						}
					}

					// also tag the bee contained in this bee's egg as analyzed
					mc.command(`data modify entity @s HandItems[0].tag.EntityTag.Tags set value ["bee_analyzed"]`)
				})

				// tag this bee as setup
				mc.command("tag @s add bee_setup")
			})

			// tag horny bees as potential parents
			mc.execute().store("result score #bee_love var").run("data get entity @s InLove")
			mc.execute().if("score #bee_love var matches 1..").run("tag @s add bee_parent")

			// bees dont drop their egg unless there's a scooper nearby
			mc.execute().as("@s[tag=!bee_scoopable]").run("data modify entity @s HandDropChances[0] set value 0.0f")
			mc.execute().as("@s[tag=bee_scoopable]").run("tag @s remove bee_scoopable")

			// bee production in nearby empty item frames
			const nearest_empty_frame = "@e[type=item_frame,distance=..20,nbt=!{Item:{}},sort=nearest,limit=1]"
			mc.execute().percent(0.01).if(`entity ${nearest_empty_frame}`).run("produce", () => {

				// move phenotypes into scoreboard
				mc.execute().store("result score #bee_group var").run("data get entity @s HandItems[0].tag.Genetics.Phenotypes[0]")
				mc.execute().store("result score #bee_tier var").run("data get entity @s HandItems[0].tag.Genetics.Phenotypes[1]")

				// make product dependent on phenotype
				// i is group
				for (let i = 0; i < data.bee_groups.length; i++)
				{
					// j is tier
					for (let j = 0; j < data.bee_groups[i].products.length; j++)
					{
						let product = data.bee_groups[i].products[j]
						let product_id = product[0]
						let product_name = product[1]
						let comb_color = product[2]
						let comb_adj = product[3]
						let comb_dye = product[4]

						mc.execute().if(`score #bee_group var matches ${i + 1}`).if(`score #bee_tier var matches ${j + 1}`).run(`data modify entity ${nearest_empty_frame} Item set value {id:"minecraft:${comb_dye}",Count:1b,tag:{display:{Name:'{"text":"${comb_adj} Comb","color":"${comb_color}","italic":false}',Lore:['[{"text":"Can be centrifuged to extract ","color":"gray","italic":false},{"text":"${product_name}","color":"${comb_color}","italic":false},{"text":".","color":"gray","italic":false}]']},special_comb:1b,comb_${product_id}:1b,Enchantments:[{}]}}`)
					}
				}
			})
		})

		// centrifuge
		mc.execute().as("@s[type=item_frame]").if("score #centrifuge_cooldown var matches 1").if("data entity @s Item.tag.centrifuge_core").positioned("~ ~-0.1 ~").if("block ~ ~ ~ smoker").if("data block ~ ~ ~ Items[{Slot:0b}].tag.special_comb").run("centrifuge", () => {

			// keep track of whether the centrifuge made anything
			mc.setScore("#centrifuge_produced", "var", 0)

			// i is group
			for (let i = 0; i < data.bee_groups.length; i++)
			{
				// j is tier
				for (let j = 0; j < data.bee_groups[i].products.length; j++)
				{
					let product = data.bee_groups[i].products[j]
					let product_id = product[0]

					mc.execute().if("score #centrifuge_produced var matches 0").if(`data block ~ ~ ~ Items[{Slot:0b}].tag.comb_${product_id}`).run(product_id, () => {

						// our product slot already has something in it
						mc.execute().if(`data block ~ ~ ~ Items[{Slot:2b}]`).run("1", () => {

							// get product count in scoreboard
							mc.execute().store("result score #centrifuge_result_amt var").run("data get block ~ ~ ~ Items[{Slot:2b}].Count")

							// only continue if we have less than a full stack of product
							mc.execute().if("score #centrifuge_result_amt var matches ..63").run("2", () => {

								// move product to the item frame itself
								mc.command("item replace entity @s container.0 from block ~ ~ ~ container.2")

								// then we can check if its the same product
								mc.execute().if(`entity @s[nbt={Item:{id:"minecraft:${product_id}"}}]`).run("3", () => {

									// add 1 to the amount of product
									mc.addScore("#centrifuge_result_amt", "var", 1)

									// increment the count in the block
									mc.execute().store("result block ~ ~ ~ Items[{Slot:2b}].Count byte 1").run("scoreboard players get #centrifuge_result_amt var")

									// mark the centrifuge as used
									mc.setScore("#centrifuge_produced", "var", 1)
								})
							})
						})

						// empty product slot
						mc.execute().unless(`data block ~ ~ ~ Items[{Slot:2b}]`).run("empty", () => {
							mc.command(`item replace block ~ ~ ~ container.2 with ${product_id}`)
							mc.setScore("#centrifuge_produced", "var", 1)
						})
					})
				}
			}

			// if this centrifuge made anything
			mc.execute().if("score #centrifuge_produced var matches 1").run("produce", () => {

				// move comb to frame
				mc.command("item replace entity @s container.0 from block ~ ~ ~ container.0")

				// put comb count into scoreboard
				mc.execute().store("result score #centrifuge_comb_amt var").run("data get block ~ ~ ~ Items[{Slot:0b}].Count")

				// subtract 1 from comb count
				mc.subtractScore("#centrifuge_comb_amt", "var", 1)

				// decrement count if there are more
				mc.execute().if("score #centrifuge_comb_amt var matches 1..").store("result block ~ ~ ~ Items[{Slot:0b}].Count byte 1").run("scoreboard players get #centrifuge_comb_amt var")

				// empty the slot if there are none
				mc.execute().if("score #centrifuge_comb_amt var matches ..0").run("item replace block ~ ~ ~ container.0 with air")
			})

			// replace the item in the frame back to normal
			mc.command(`item replace entity @s container.0 with firework_star${data.centrifuge_core_tag}`)

			// wear out core after continuous use
			mc.execute().if("score #centrifuge_produced var matches 1").percent(1).run("break", () => {
				mc.command(`item replace entity @s container.0 with firework_star${data.centrifuge_core_worn_tag}`)
				mc.command("playsound block.lava.extinguish master @a ~ ~ ~")
			})
		})
	},
	
	// /summon villager ~ ~ ~ {Offers:{Recipes:[]}}
	
	// /give @p bee_spawn_egg 1
	["tick-players"]: data => {

		// full bee suit calms bees down
		mc.execute().if("data entity @s Inventory[{Slot:100b}].tag.bee_suit").if("data entity @s Inventory[{Slot:101b}].tag.bee_suit").if("data entity @s Inventory[{Slot:102b}].tag.bee_suit").if("data entity @s Inventory[{Slot:103b}].tag.bee_suit").as("@e[type=bee,distance=..10]").run("data modify entity @s AngerTime set value 0")

		// bee scoop makes nearby bees drop their eggs
		mc.execute().if("data entity @s SelectedItem.tag.bee_scoop").as("@e[type=bee,distance=..7]").run("bee-scoopable", () => {
			mc.command("data modify entity @s HandDropChances[0] set value 1.0f")
			mc.command("tag @s add bee_scoopable")
		})

		// beealyzer
		mc.execute().if("score #beealyzer_cooldown var matches 1").if("data entity @s SelectedItem.tag.beealyzer").run("beealyzer", () => {

			// see if we're looking at a bee
			mc.setScore("#beealyzer_dist", "var", 0)
			mc.setScore("#beealyzer_fail", "var", 0)
			mc.setScore("#beealyzer_succ", "var", 0)

			// recursion loop
			mc.execute().anchored("eyes").run("loop", () => {

				mc.command("scoreboard players add #beealyzer_dist var 1")
				mc.execute().unless("block ^ ^ ^0.2 #oyumod:air").run("scoreboard players set #beealyzer_fail var 1")

				// tag a bee if we're looking at one
				mc.execute().positioned(mc.relativeCoords(0, -0.1, 0)).as("@e[type=bee,distance=..0.5,limit=1,sort=nearest]").run("succ", () => {
					mc.command("tag @s add bee_analyze")
					mc.command("particle happy_villager ~ ~ ~ 0.2 0.2 0.2 0.01 10 force")
					mc.setScore("#beealyzer_succ", "var", 1)
				})

				// keep going
				mc.execute().if("score #beealyzer_dist var matches ..40").if("score #beealyzer_succ var matches 0").if("score #beealyzer_fail var matches 0").positioned("^ ^ ^0.2").recurse()
			})

			// display info of found bee
			mc.execute().if("score #beealyzer_succ var matches 1").run("display", () => {

				// sound
				mc.command("playsound block.note_block.bit master @s ~ ~ ~ 1 0.7")
				mc.command("playsound block.note_block.bit master @s ~ ~ ~ 1 1.4")

				// print
				mc.command(`tellraw @s {"text":"=== Bee Analyzed ===","color":"gray"}`)
				// mc.command(`tellraw @s {"text":"First two alleles determine group.","color":"gray"}`)
				// mc.command(`tellraw @s {"text":"Second two alleles determine tier.","color":"gray"}`)

				// put the bee's data into the scoreboard
				mc.execute().as("@e[type=bee,limit=1,tag=bee_analyze]").run("getdata", () => {
					for (let i = 0; i < 4; i++) {
						mc.execute().store(`result score #beealyzer_allele_${i} var`).run(`data get entity @s HandItems[0].tag.Genetics.Genotype[${i}]`)
						mc.execute().store(`result score #beealyzer_allele_source_${i} var`).run(`data get entity @s HandItems[0].tag.Genetics.AlleleSources[${i}]`)
						if (i < 2)
							mc.execute().store(`result score #beealyzer_phenotype_${i} var`).run(`data get entity @s HandItems[0].tag.Genetics.Phenotypes[${i}]`)
					}
				})
				

				// print genotype - attempt #2
				let j = []
				for (j[0] = 0; j[0] < 7; j[0]++)
				{
					for (j[1] = 0; j[1] < 7; j[1]++)
					{
						for (j[2] = 0; j[2] < 4; j[2]++)
						{
							for (j[3] = 0; j[3] < 4; j[3]++)
							{
								mc.execute().if(`score #beealyzer_allele_0 var matches ${j[0] + 1}`).if(`score #beealyzer_allele_1 var matches ${j[1] + 1}`).if(`score #beealyzer_allele_2 var matches ${j[2] + 1}`).if(`score #beealyzer_allele_3 var matches ${j[3] + 1}`).run(`tellraw @s [{"text":"Genotype: ","color":"gray"},{"text":"${data.bee_groups[j[0]].allele}","color":"${data.bee_groups[j[0]].color}"},{"text":"${data.bee_groups[j[1]].allele}","color":"${data.bee_groups[j[1]].color}"},{"text":"${data.bee_tiers[j[2]][0]}","color":"${data.bee_tiers[j[2]][1]}"},{"text":"${data.bee_tiers[j[3]][0]}","color":"${data.bee_tiers[j[3]][1]}"}]`)
							}
						}
					}
				}

				// print phenotype
				// 7 groups
				for (let i = 0; i < 7; i++) {
					// 4 tiers
					for (let j = 0; j < 4; j++) {
						mc.execute().if(`score #beealyzer_phenotype_0 var matches ${i + 1}`).if(`score #beealyzer_phenotype_1 var matches ${j + 1}`).run(`${i}-${j}`, () => {
							mc.command(`tellraw @s [{"text":"Phenotype: ","color":"gray"},{"text":"${data.bee_groups[i].name}","color":"${data.bee_groups[i].color}","hoverEvent":{"action":"show_text","contents":[{"text":"Group ","color":"gray"},{"text":"${data.bee_groups[i].name}","color":"${data.bee_groups[i].color}"}]}},{"text":"-","color":"gray"},{"text":"${j + 1}","color":"${data.bee_tiers[j][1]}","hoverEvent":{"action":"show_text","contents":[{"text":"Tier ","color":"gray"},{"text":"${j + 1}","color":"${data.bee_tiers[j][1]}"}]}}]`)
							mc.command(`tellraw @s [{"text":"Byproduct: ","color":"gray"},{"text":"${data.bee_groups[i].products[j][1]}","color":"${data.bee_groups[i].products[j][2]}","hoverEvent":{"action":"show_text","contents":[{"text":"${data.bee_groups[i].products[j][1]}","color":"${data.bee_groups[i].products[j][2]}"},{"text":" can be extracted from this bee's special combs.","color":"gray"}]}}]`)
						})
					}
				}

				// write genetic data to description of bee's dropped egg
				mc.execute().as("@e[type=bee,limit=1,tag=bee_analyze,tag=!bee_analyzed]").run("egg", () => {
					let i = []
					for (i[0] = 0; i[0] < 7; i[0]++) {
						for (i[1] = 0; i[1] < 7; i[1]++) {
							for (i[2] = 0; i[2] < 4; i[2]++) {
								for (i[3] = 0; i[3] < 4; i[3]++) {
									let group = Math.min(i[0], i[1])
									let tier = Math.min(i[2], i[3])
									mc.execute().if(`score #beealyzer_allele_0 var matches ${i[0] + 1}`).if(`score #beealyzer_allele_1 var matches ${i[1] + 1}`).if(`score #beealyzer_allele_2 var matches ${i[2] + 1}`).if(`score #beealyzer_allele_3 var matches ${i[3] + 1}`).run(`data modify entity @s HandItems[0].tag.display.Lore set value ['[{"text":"Genotype: ","color":"gray","italic":false},{"text":"${data.bee_groups[i[0]].allele}","color":"${data.bee_groups[i[0]].color}","italic":false},{"text":"${data.bee_groups[i[1]].allele}","color":"${data.bee_groups[i[1]].color}","italic":false},{"text":"${data.bee_tiers[i[2]][0]}","color":"${data.bee_tiers[i[2]][1]}","italic":false},{"text":"${data.bee_tiers[i[3]][0]}","color":"${data.bee_tiers[i[3]][1]}","italic":false}]','[{"text":"Phenotype: ","color":"gray","italic":false},{"text":"${data.bee_groups[group].name}","color":"${data.bee_groups[group].color}","italic":false},{"text":"-","color":"gray","italic":false},{"text":"${tier + 1}","color":"${data.bee_tiers[tier][1]}","italic":false}]','[{"text":"Byproduct: ","color":"gray","italic":false},{"text":"${data.bee_groups[group].products[tier][1]}","color":"${data.bee_groups[group].products[tier][2]}","italic":false}]']`)
								}
							}
						}
					}

					// tag this current bee as analyzed
					mc.command("tag @s add bee_analyzed")

					// also tag the bee contained in this bee's egg as analyzed
					mc.command(`data modify entity @s HandItems[0].tag.EntityTag.Tags set value ["bee_analyzed"]`)
				})

				// un-tag this bee, we're all done
				mc.command("tag @e[type=bee,tag=bee_analyze] remove bee_analyze")
			})
		})
	},
	["tick-entities-fresh-trader"]: () => {
		// beekeeper NPC
		mc.execute().run(`data modify entity @s Offers.Recipes append value {maxUses:1,buy:{id:"minecraft:dandelion",Count:10b},buyB:{id:"minecraft:poppy",Count:10b},sell:{id:"minecraft:bee_spawn_egg",Count:1b,tag:{display:{Name:'{"text":"Beekeeper NPC","color":"yellow","italic":false}'},EntityTag:{id:"minecraft:villager",Silent:1b,PersistenceRequired:1b,CustomName:'{"text":"Beekeeper","color":"yellow","italic":false}',HandItems:[{id:"minecraft:dandelion",Count:1b},{}],VillagerData:{level:99,profession:"minecraft:nitwit",type:"minecraft:desert"},Offers:{Recipes:[{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:glass_bottle",Count:1b},buyB:{id:"minecraft:wheat_seeds",Count:8b},sell:{id:"minecraft:potion",Count:1b,tag:{display:{Name:'{"text":"Seed Oil","color":"white","italic":false}'},HideFlags:32,CustomPotionColor:12104220}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:copper_ingot",Count:1b},buyB:{id:"minecraft:potion",Count:1b,tag:{display:{Name:'{"text":"Seed Oil","color":"white","italic":false}'},HideFlags:32,CustomPotionColor:12104220}},sell:{id:"minecraft:copper_ingot",Count:1b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,CustomModelData:12490001}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:copper_ingot",Count:4b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,CustomModelData:12490001}},buyB:{id:"minecraft:redstone",Count:2b},sell:{id:"minecraft:clock",Count:1b,tag:{display:{Name:'{"text":"Beealyzer","color":"yellow","italic":false}',Lore:['{"text":"Aim at a bee to see its genetic data.","color":"gray","italic":false}']},beealyzer:1b,CustomModelData:12490001}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:stick",Count:2b},buyB:{id:"minecraft:white_wool",Count:1b},sell:{id:"minecraft:iron_shovel",Count:1b,tag:{display:{Name:'{"text":"Bee Scoop","color":"yellow","italic":false}',Lore:['{"text":"Hit bees to scoop them up.","color":"gray","italic":false}','{"text":"Doesn\\'t work on baby bees.","color":"gray","italic":false}']},HideFlags:3,bee_scoop:1b,CustomModelData:12490001,Enchantments:[{id:"minecraft:bane_of_arthropods",lvl:10s}],AttributeModifiers:[{AttributeName:"generic.attack_speed",Name:"generic.attack_speed",Amount:8,Operation:0,UUID:[I;-358646086,-2090973918,-1928468940,1275977905],Slot:"mainhand"}]}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:shears",Count:1b},buyB:{id:"minecraft:copper_ingot",Count:2b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,CustomModelData:12490001}},sell:{id:"minecraft:shears",Count:1b,tag:{display:{Name:'{"text":"Beears","color":"yellow","italic":false}',Lore:['{"text":"Used to get special combs from beehives.","color":"gray","italic":false}']},CustomModelData:12490001,bee_shears:1b}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:dandelion",Count:4b},buyB:{id:"minecraft:poppy",Count:4b},sell:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:oxeye_daisy",Count:4b},buyB:{id:"minecraft:azure_bluet",Count:4b},sell:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:allium",Count:4b},buyB:{id:"minecraft:blue_orchid",Count:4b},sell:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:cornflower",Count:4b},buyB:{id:"minecraft:lily_of_the_valley",Count:4b},sell:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:white_tulip",Count:4b},buyB:{id:"minecraft:red_tulip",Count:4b},sell:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:pink_tulip",Count:4b},buyB:{id:"minecraft:orange_tulip",Count:4b},sell:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:copper_ingot",Count:10b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,CustomModelData:12490001}},buyB:{id:"minecraft:repeater",Count:2b},sell:{id:"minecraft:firework_star",Count:1b,tag:{display:{Name:'{"text":"Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Place in an item frame on top of","color":"gray","italic":false}','{"text":"a smoker to make a centrifuge.","color":"gray","italic":false}']},HideFlags:32,centrifuge_core:1b,CustomModelData:12490001,Explosion:{Type:0}}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:firework_star",Count:1b,tag:{display:{Name:'{"text":"Worn-Out Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Can be repaired with Bee Glue.","color":"gray","italic":false}']},HideFlags:32,worn_out_centrifuge_core:1b,CustomModelData:12490002,Explosion:{Type:0}}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}},sell:{id:"minecraft:firework_star",Count:1b,tag:{display:{Name:'{"text":"Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Place in an item frame on top of","color":"gray","italic":false}','{"text":"a smoker to make a centrifuge.","color":"gray","italic":false}']},HideFlags:32,centrifuge_core:1b,CustomModelData:12490001,Explosion:{Type:0}}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:copper_ingot",Count:3b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,CustomModelData:12490001}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}},sell:{id:"minecraft:leather_helmet",Count:1b,tag:{display:{Name:'{"text":"Bee Suit Helmet","color":"yellow","italic":false}',Lore:['{"text":"Full set keeps bees from getting angry.","color":"gray","italic":false}'],color:3157248},HideFlags:66,bee_suit:1b}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:copper_ingot",Count:5b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,CustomModelData:12490001}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}},sell:{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{Name:'{"text":"Bee Suit Top","color":"yellow","italic":false}',Lore:['{"text":"Full set keeps bees from getting angry.","color":"gray","italic":false}'],color:16771415},HideFlags:66,bee_suit:1b}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:copper_ingot",Count:4b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,CustomModelData:12490001}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}},sell:{id:"minecraft:leather_leggings",Count:1b,tag:{display:{Name:'{"text":"Bee Suit Pants","color":"yellow","italic":false}',Lore:['{"text":"Full set keeps bees from getting angry.","color":"gray","italic":false}'],color:16771415},HideFlags:66,bee_suit:1b}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:copper_ingot",Count:2b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,CustomModelData:12490001}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},CustomModelData:12490001}},sell:{id:"minecraft:leather_boots",Count:1b,tag:{display:{Name:'{"text":"Bee Suit Boots","color":"yellow","italic":false}',Lore:['{"text":"Full set keeps bees from getting angry.","color":"gray","italic":false}'],color:3157248},HideFlags:66,bee_suit:1b}}}]},Brain:{memories:{"minecraft:job_site":{value:{pos:[I;0,-1,0],dimension:"minecraft:the_end"}}}}}}}}`)

/*
		// beealyzer
		mc.execute().percent(60).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:dandelion",Count:10b},buyB:{id:"minecraft:poppy",Count:10b},sell:{id:"minecraft:clock",Count:1b,tag:{display:{Name:'{"text":"Beealyzer","color":"gold","italic":false}',Lore:['{"text":"Point this at a bee to see its genetic data.","color":"gray","italic":false}']},beealyzer:1b}}}`)

		// scoop
		mc.execute().percent(60).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:8b},sell:{id:"minecraft:iron_shovel",Count:1b,tag:{display:{Name:'{"text":"Bee Scoop","color":"gold","italic":false}',Lore:['{"text":"Can be used to scoop bees up into your inventory.","color":"gray","italic":false}']},HideFlags:1,bee_scoop:1b,Enchantments:[{id:"minecraft:bane_of_arthropods",lvl:10s}]}}}`)
*/
	}
}
