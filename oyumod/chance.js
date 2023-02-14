const mc = require("./../mcdpi")
const util = require("./util")

module.exports = {
	id: "chance-cubes",
	name: "Chance Cubes",
	desc: "Blocks crafted from lapis that do something random when broken.",
	updated: [2, 12, 23],
	data: {
		outcomes: [
			`tellraw @a[distance=..10] "Nothing!"`,
			`summon creeper ~ ~ ~ {Fuse:0,ExplosionRadius:30,CustomName:'{"text":"Red Matter Explosion","color":"red"}'}`,
			//`summon wither ~ ~ ~ {CustomName:'{"text":"Robert"}'}`,
			//`summon wither ~ ~ ~ {CustomName:'{"text":"Al-Guru"}',Health:1f,Attributes:[{Name:generic.max_health,Base:1}]}`,
			`summon minecart ~ ~ ~ {CustomNameVisible:1b,Passengers:[{id:"minecraft:creeper",ExplosionRadius:7b,Fuse:10,ActiveEffects:[{Id:14b,Amplifier:0b,Duration:200,ShowParticles:0b}]}],CustomName:'{"text":"The Death Cab","color":"dark_red","italic":false}'}`,
			`execute as @a[distance=..20] at @s positioned ^ ^ ^-1.5 run playsound entity.creeper.primed hostile @s ~ ~ ~`,
			`setblock ~ ~ ~ bedrock`,
			`summon item ~ ~ ~ {PickupDelay:10,Item:{id:"iron_shovel",Count:1b,tag:{display:{Name:'{"text":"Bug Swatter","color":"#33FFCF","italic":false}'},Enchantments:[{id:"minecraft:bane_of_arthropods",lvl:5s}],AttributeModifiers:[{AttributeName:"generic.attack_speed",Name:"generic.attack_speed",Amount:3,Operation:0,UUIDLeast:143398,UUIDMost:173422,Slot:"mainhand"}]}}}`,
			`summon item ~ ~ ~ {Item:{id:"minecraft:stick",Count:1b}}`,
			`summon item ~ ~ ~ {Item:{id:"minecraft:ender_chest",Count:2b}}`,
			`summon end_crystal ~ ~1 ~`,
			`setblock ~ ~ ~ tnt[unstable=true]`,
			`summon slime ~ ~ ~ {Size:2,Passengers:[{id:"minecraft:slime",Size:1,Passengers:[{id:"minecraft:slime",CustomNameVisible:1b,Size:0,CustomName:'{"text":"Slime Man","color":"green","italic":false}'}]}]}`,
			`summon tropical_fish ~ ~ ~ {CustomNameVisible:1b,CustomName:'{"text":"Nemo","color":"#FFA024","italic":false}',Variant:65536}`,
			`summon item ~ ~ ~ {Item:{id:"minecraft:stick",Count:1b,tag:{display:{Name:'{"text":"Diplomacy","italic":false}',Lore:['{"text":"You will go far.","color":"gray","italic":false}']},Enchantments:[{id:"minecraft:sharpness",lvl:5s}]}}}`,
			`summon item ~ ~ ~ {Item:{id:"minecraft:oak_sign",Count:1b,tag:{display:{Name:'{"text":"Zistonian Battle Sign","italic":false}'},Enchantments:[{id:"minecraft:sharpness",lvl:5s},{id:"minecraft:knockback",lvl:2s},{id:"minecraft:fire_aspect",lvl:2s},{id:"minecraft:looting",lvl:3s}],BlockEntityTag:{}}}}`,
			`summon item ~ ~ ~ {Item:{id:"minecraft:iron_sword",Count:1b,tag:{display:{Name:'{"text":"White Fang"}',Lore:['{"text":"Warms your hand when"}','{"text":" you hold it..."}']},Enchantments:[{id:"minecraft:sharpness",lvl:3s},{id:"minecraft:unbreaking",lvl:5s},{id:"minecraft:mending",lvl:1s}],AttributeModifiers:[{AttributeName:"generic.attack_speed",Name:"generic.attack_speed",Amount:3,Operation:0,UUID:[I;1574830421,1922910004,-1541092342,1768262407],Slot:"mainhand"},{AttributeName:"generic.armor",Name:"generic.armor",Amount:1,Operation:0,UUID:[I;701905492,-1602204993,-1841010310,1585551439],Slot:"mainhand"}]}}}`,
			`summon item ~ ~ ~ {Item:{id:"minecraft:fire_charge",Count:3b,tag:{Enchantments:[{id:"minecraft:fire_aspect",lvl:2s}]}}}`,
			`summon item ~ ~ ~ {PickupDelay:10,Item:{id:"raw_gold",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:'{"text":"Ocarina of Healing","color":"gold","italic":false}',Lore:['{"text":"I will play the song of my people.","color":"gray","italic":false}']},instrument:1b,instrument_flute:1b,charm:1b,charm_regen:1b}}}`,
			`summon mooshroom ~ ~ ~ {CustomName:'{"text":"Pickles","italic":false}'}`,
			`summon item ~ ~ ~ {Item:{id:"minecraft:bamboo",Count:1b,tag:{display:{Name:'{"text":"Blowgun","italic":false}'},Enchantments:[{}]}}}`,
			[`tellraw @a[distance=..10] "Guess I got the Midas touch..."`, `summon item ~ ~ ~ {Item:{id:"minecraft:golden_sword",Count:1b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:golden_pickaxe",Count:1b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:golden_shovel",Count:1b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:golden_axe",Count:1b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:golden_hoe",Count:1b}}`],
			[`tellraw @a[distance=..10] "Welcome back, SethBling here :)"`, `summon item ~ ~ ~ {Item:{id:"minecraft:redstone",Count:64b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:repeater",Count:16b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:redstone_torch",Count:24b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:piston",Count:8b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:sticky_piston",Count:8b}}`],
			[`tellraw @a[distance=..10] "Do you wanna build a snowman?"`, `summon item ~ ~ ~ {Item:{id:"minecraft:snow_block",Count:2b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:carved_pumpkin",Count:1b}}`],
			[`setblock ~ ~ ~ jukebox[has_record=true]{RecordItem:{id:"music_disc_stal",Count:1b}} destroy`, `playsound music_disc.stal master @a ~ ~ ~ 1 2`],
			[`tellraw @a[distance=..10] "Let's go sailing!"`, `setblock ~ ~-1 ~ water`, `summon boat`],
			[`setblock ~ ~ ~ cake`, `tellraw @a[distance=..10] "...but is it a lie? UwU"`],
			[`weather rain`, `tellraw @a[distance=..10] {"text":"Rain, rain, go away.","color":"#1957FF"}`],
			[`fill ~-2 ~ ~-2 ~2 ~1 ~2 bookshelf`, `fill ~-1 ~ ~-1 ~1 ~1 ~1 air`, `setblock ~ ~ ~ enchanting_table`],
			[`tellraw @a[distance=..20] "<FurLord69> feaw me!!! u wiww feew the wath of the fuwlowd!!!"`, `summon fox ~ ~ ~ {CustomNameVisible:1b,CustomName:'{"text":"FurLord69","italic":false}',ArmorItems:[{id:"minecraft:leather_boots",Count:1b,tag:{display:{Name:'{"text":"Fursuit Boots","color":"gray","italic":false}',Lore:['{"text":"^_^","color":"gray","italic":false}'],color:16776683}}},{id:"minecraft:leather_leggings",Count:1b,tag:{display:{Name:'{"text":"Fursuit Bottom","color":"gold","italic":false}',Lore:['{"text":"UwU","color":"gray","italic":false}'],color:16752159}}},{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{Name:'{"text":"Fursuit Top","color":"gold","italic":false}',Lore:['{"text":">w<","color":"gray","italic":false}'],color:16752159}}},{id:"minecraft:player_head",Count:1b,tag:{display:{Name:'{"text":"Fursuit Mask","color":"gold","italic":false}',Lore:['{"text":"*notices ur bulgey wulgey*","color":"gray","italic":false}']},SkullOwner:{Id:[I;731662136,-1494137219,-1557640952,-1336795871],Properties:{textures:[{Value:"eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYTg3YmU2NTg5NzQ4ZDM0OTY3Mjc4YWRhNmVjYjVlOGEwMmE0MjgzOWYzZGJkMWZkMjU0Yzk2OWFlMDllOWY1NiJ9fX0="}]}}}}],ArmorDropChances:[1.000F,1.000F,1.000F,1.000F]}`],
			[`fill ~-1 ~-1 ~-1 ~1 ~-1 ~1 stone_bricks`, `fill ~-1 ~3 ~-1 ~1 ~3 ~1 stone_brick_slab`, `setblock ~ ~3 ~ stone_bricks`, `fill ~-1 ~ ~1 ~1 ~2 ~1 iron_bars`, `fill ~-1 ~ ~-1 ~1 ~2 ~-1 iron_bars`, `fill ~1 ~ ~ ~1 ~2 ~ iron_bars`, `fill ~-1 ~ ~ ~-1 ~2 ~ iron_bars`, `setblock ~2 ~1 ~ oak_wall_sign[facing=east]{Text2:'{"text":"HELP ME!","color":"dark_red","bold":true}'}`, `setblock ~-2 ~1 ~ oak_wall_sign[facing=west]{Text2:'{"text":"HELP ME!","color":"dark_red","bold":true}'}`, `setblock ~ ~1 ~2 oak_wall_sign[facing=south]{Text2:'{"text":"HELP ME!","color":"dark_red","bold":true}'}`, `setblock ~ ~1 ~-2 oak_wall_sign[facing=north]{Text2:'{"text":"HELP ME!","color":"dark_red","bold":true}'}`, `summon villager ~ ~ ~`, `summon tnt ~ ~0.5 ~ {Fuse:60}`],
			[`tellraw @a[distance=..8] "No XP for you!"`, `xp set @a[distance=..8] 0 levels`, `xp set @a[distance=..8] 0 points`],
			[`fill ~-1 ~ ~-1 ~1 ~2 ~1 air destroy`, `fill ~-1 ~ ~-1 ~1 ~ ~1 gold_block`, `setblock ~ ~ ~ mossy_cobblestone`, `setblock ~ ~1 ~ netherrack`, `setblock ~ ~2 ~ fire`, `setblock ~1 ~1 ~1 redstone_torch`, `setblock ~-1 ~1 ~1 redstone_torch`, `setblock ~1 ~1 ~-1 redstone_torch`, `setblock ~-1 ~1 ~-1 redstone_torch`, `summon lightning_bolt ~ ~2 ~`, `playsound entity.lightning_bolt.thunder master @a ~ ~ ~ 2 1.6`],
			[`summon sheep ~ ~ ~ {Color:14b}`, `summon sheep ~ ~ ~ {Color:1b}`, `summon sheep ~ ~ ~ {Color:4b}`, `summon sheep ~ ~ ~ {Color:5b}`, `summon sheep ~ ~ ~ {Color:3b}`, `summon sheep ~ ~ ~ {Color:2b}`],
			[`tellraw @a[distance=..20] {"text":"Dududududu...","color":"#FFD175"}`, `execute at @p positioned ~ ~20 ~ run fill ~-3 ~ ~-3 ~3 ~3 ~3 sand destroy`],
			[`particle explosion ~ ~ ~ 2 2 2 0.1 30 force`, `playsound entity.generic.explode master @a ~ ~ ~`],
			[`tellraw @a[distance=..10] "No."`, `function chance-cubes:summon-chance-cube`],
			[`tellraw @a[distance=..10] "*unchances your cube*"`, `setblock ~ ~ ~ cyan_stained_glass`],
			[`tellraw @a[distance=..10] {"text":"...and you will know my name is the lord!","color":"dark_red","italic":true}`, `execute at @a[distance=..10] run summon lightning_bolt`, "playsound entity.generic.explode master @a ~ ~ ~ 1 0.5"],
			[`tellraw @a[distance=..10] "thank u for purchasing the Saplings DLC"`, `summon item ~ ~ ~ {Item:{id:"minecraft:oak_sapling",Count:4b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:birch_sapling",Count:4b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:acacia_sapling",Count:4b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:jungle_sapling",Count:4b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:spruce_sapling",Count:4b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:dark_oak_sapling",Count:4b}}`],
			[`summon fox ~ ~ ~ {Silent:1b,HandItems:[{id:"minecraft:apple",Count:1b},{}],ActiveEffects:[{Id:14b,Amplifier:0b,Duration:199980,ShowParticles:0b}]}`, `summon chicken ~ ~ ~ {CustomNameVisible:1b,CustomName:'{"text":"The Doctor","italic":false}'}`],
			[`summon blaze ~ ~ ~ {CustomName:'{"text":"Cheech"}',HandItems:[{id:"minecraft:grass",Count:1b},{}],HandDropChances:[1.000F,0.085F]}`, `summon blaze ~ ~ ~ {CustomName:'{"text":"Chong"}',HandItems:[{id:"minecraft:grass",Count:1b},{}],HandDropChances:[1.000F,0.085F]}`],
			[`setblock ~ ~ ~ trapped_chest{Items:[{Slot:13b,id:"minecraft:diamond",Count:1b}],CustomName:'{"text":"hehehehehehehehehehehehehe"}'} replace`, `setblock ~ ~-2 ~ tnt replace`],
			[`tellraw @a[distance=..10] "Tuff luck, buddy."`, `setblock ~ ~ ~ tuff`],
			[`summon zombie ~ ~ ~ {DeathLootTable:"minecraft:blocks/red_mushroom",CustomName:'{"text":"Marco"}',HandItems:[{id:"minecraft:iron_hoe",Count:1b},{}],HandDropChances:[0.000F,0.085F],ArmorItems:[{id:"minecraft:leather_boots",Count:1b,tag:{display:{color:6043910}}},{id:"minecraft:leather_leggings",Count:1b,tag:{display:{color:1537279}}},{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{color:16711680}}},{id:"minecraft:leather_helmet",Count:1b,tag:{display:{color:16711680}}}],ArmorDropChances:[0.085F,0.000F,0.000F,0.000F]}`, `summon zombie ~ ~ ~ {DeathLootTable:"minecraft:blocks/brown_mushroom",CustomName:'{"text":"Leonardo"}',HandItems:[{id:"minecraft:iron_hoe",Count:1b},{}],HandDropChances:[0.000F,0.085F],ArmorItems:[{id:"minecraft:leather_boots",Count:1b,tag:{display:{color:6043910}}},{id:"minecraft:leather_leggings",Count:1b,tag:{display:{color:1537279}}},{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{color:53047}}},{id:"minecraft:leather_helmet",Count:1b,tag:{display:{color:53047}}}],ArmorDropChances:[0.085F,0.000F,0.000F,0.000F]}`],
			["weather rain", `summon zombie ~ ~ ~ {CustomName:'{"text":"Carter"}',HandItems:[{id:"minecraft:milk_bucket",Count:1b},{}],HandDropChances:[1.000F,0.085F]}`],
			[`tellraw @a[distance=..10] "Oh, shoot!"`, `setblock ~ ~-1 ~ dirt`, `fill ~ ~ ~ ~ ~9 ~ bamboo`],
			[`summon item ~ ~ ~ {Item:{id:"minecraft:potato",Count:1b}}`, `tellraw @a[distance=..10] "Your wish came true! (If you wished for a potato)"`],
			[`summon item ~ ~ ~ {Item:{id:"minecraft:diamond",Count:1b}}`, `setblock ~ ~-1 ~ lava`],
			[`summon item ~ ~ ~ {Item:{id:"minecraft:water_bucket",Count:1b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:lava_bucket",Count:1b}}`, `summon item ~ ~ ~ {Item:{id:"minecraft:milk_bucket",Count:1b}}`],
			[
				"setblock ~ ~-1 ~ stone",
				"setblock ~1 ~-1 ~ stone",
				"setblock ~-1 ~-1 ~ stone",
				"setblock ~ ~-1 ~1 stone",
				"setblock ~ ~-1 ~-1 stone",
				"setblock ~ ~ ~ stone_pressure_plate",
				"setblock ~-1 ~ ~ iron_door[half=lower,hinge=right,facing=north]",
				"setblock ~-1 ~1 ~ iron_door[half=upper,hinge=right,facing=north]",
				"setblock ~1 ~ ~ iron_door[half=lower,hinge=right,facing=south]",
				"setblock ~1 ~1 ~ iron_door[half=upper,hinge=right,facing=south]",
				"setblock ~ ~ ~1 iron_door[half=lower,hinge=right,facing=west]",
				"setblock ~ ~1 ~1 iron_door[half=upper,hinge=right,facing=west]",
				"setblock ~ ~ ~-1 iron_door[half=lower,hinge=right,facing=east]",
				"setblock ~ ~1 ~-1 iron_door[half=upper,hinge=right,facing=east]",
				"setblock ~ ~2 ~ stone_slab"
			],
			() => {
				mc.command(`tellraw @a[distance=..10] "I heard you like chance cubes, so I put chance cubes in your chance cube..."`)
				for (let i = 0; i < 3; i++)
					mc.command(`summon item ~ ~ ~ {Item:{id:"minecraft:cyan_stained_glass",Count:1b,tag:${util.chance_cube_nbt}}}`);
			},
			() => {
				for (let i = 0; i < 5; i++)
					mc.command(`summon bat ~ ~ ~ {Passengers:[{id:"minecraft:magma_cube",CustomNameVisible:1b,Size:0,CustomName:'{"text":"Nether Jellyfish","color":"#9C1000","italic":false}'}]}`)
			},
			() => {
				let ores = ["coal", "iron", "gold", "diamond", "emerald", "lapis_lazuli", "redstone"]
				for (const i in ores)
					mc.command(`summon item ~ ~ ~ {Item:{id:"minecraft:${ores[i]}_ore",Count:1b}}`)
			},
			() => {
				mc.command("fill ~-2 ~ ~-2 ~2 ~2 ~2 air")
				mc.command("setblock ~ ~ ~ obsidian")
				mc.execute().positioned(mc.relativeCoords(0, 1, 0)).run("function chance-cubes:summon-chance-cube")
				for (let x = -1; x < 2; x += 2)
				{
					for (let z = -1; z < 2; z += 2)
					{
						mc.command(`fill ~${x * 2} ~ ~${z * 2} ~${x * 2} ~1 ~${z * 2} obsidian`)
						mc.execute().positioned(mc.relativeCoords(x * 2, 2, z * 2)).run("function chance-cubes:summon-chance-cube")
					}
				}
			},
			() => {
				mc.command("playsound ambient.cave master @a ~ ~ ~ 1 2")
				mc.buildStatue("ascending", [
					{item: "oak_planks", pos: mc.relativeCoords(0, 0, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(0, 1, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(0, 2, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(0, 3, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(0, 4, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(0, 5, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(0, 6, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(1, 4, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(2, 4, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(-1, 4, 0)},
					{item: "oak_planks", pos: mc.relativeCoords(-2, 4, 0)},
				])
			},
			() => {
				mc.command(`tellraw @a[distance=..20] {"text":"Creeper invasion!","color":"green"}`)
				for (let i = 0; i < 10; i++)
					mc.command("summon creeper")
			},
			() => {
				mc.command(`tellraw @a[distance=..20] "Oh SHIT!!! Jihadi cats! RUN!!!!!1!!"`)
				for (let i = 0; i < 5; i++)
					mc.command(`summon ocelot ~ ~ ~ {Passengers:[{id:"minecraft:tnt",Fuse:50}]}`)
			},
			() => {
				mc.command(`tellraw @a[distance=..10] "Ground control to Major Tom..."`)
				mc.execute().as("@p").at("@s").run("rocket", () => {
					mc.command(`effect give @s levitation 1 75 true`)
					mc.command(`playsound entity.firework_rocket.launch master @a ~ ~ ~ 1 0.7`)
					mc.command(`playsound minecraft:entity.generic.explode master @a ~ ~ ~ 1 1.4`)
				})
			},
			() => {
				mc.command(`tellraw @a[distance=..30] {"text":"May death rain upon them...","color":"light_purple"}`)
				for (let x = -1; x < 2; x++)
				{
					for (let z = -1; z < 2; z++)
						mc.command(`summon tnt ~${x * 5} ~40 ~${z * 5} {Fuse:100}`)
				}
			},
			() => {
				mc.execute().as("@p[distance=..10]").at("@s").positioned(mc.relativeCoords(0, -1, 0)).run("lava", () => {
					mc.command("fill ~-1 ~ ~-1 ~1 ~ ~1 lava destroy")
				})
			},
			() => {
				mc.execute().as("@p[distance=..10]").at("@s").positioned("~ 240 ~").run("skyblock", () => {
					mc.command("fill ~-3 ~ ~2 ~2 ~1 ~ dirt")
					mc.command("fill ~ ~ ~-3 ~2 ~1 ~ dirt")
					mc.command("fill ~-3 ~2 ~ ~2 ~2 ~2 grass_block")
					mc.command("fill ~ ~2 ~-3 ~2 ~2 ~ grass_block")
					mc.command("fill ~-1 ~6 ~ ~-5 ~7 ~4 oak_leaves")
					mc.command("fill ~-2 ~8 ~1 ~-4 ~8 ~3 oak_leaves")
					mc.command("fill ~-3 ~9 ~1 ~-3 ~9 ~3 oak_leaves")
					mc.command("fill ~-2 ~9 ~2 ~-4 ~9 ~2 oak_leaves")
					mc.command("fill ~-3 ~3 ~2 ~-3 ~7 ~2 oak_log")
					mc.command(`setblock ~1 ~3 ~-3 chest[facing=south]{Items:[{Slot:0b,id:"minecraft:string",Count:12b},{Slot:1b,id:"minecraft:lava_bucket",Count:1b},{Slot:2b,id:"minecraft:bone",Count:1b},{Slot:3b,id:"minecraft:sugar_cane",Count:1b},{Slot:9b,id:"minecraft:red_mushroom",Count:1b},{Slot:10b,id:"minecraft:ice",Count:2b},{Slot:11b,id:"minecraft:pumpkin_seeds",Count:1b},{Slot:18b,id:"minecraft:brown_mushroom",Count:1b},{Slot:19b,id:"minecraft:melon_slice",Count:1b},{Slot:20b,id:"minecraft:cactus",Count:1b}]}`)
					mc.command("tp @s ~1 ~4 ~1")
				})
			},
			() => {
				const fun_facts = [
					`Paper cannot be folded in half more than 9 times.`,
					`You burn more calories while sleeping than sitting.`,
					`Most of the dust in your house is your own dead skin.`,
					`Pearls melt in vinegar. Famous moron Cleopatra once drank that. I\\'m serious, Google it.`,
					`Drinking is not hurting my life.`,
					`35% of married people in advertisements are actually married for real.`,
					`Elephants can stand on their head. I also can do many cool things aside from writing facts. You just don\\'t know that, do you? Because you never bothered to ask. I\\'m starting to think you don\\'t even care about me. You\\'re just here while the fun facts are flowing. And then you will leave. They always leave. Why do they always leave?`,
					`Only 55% of Americans know the sun is a star. 29% of Europeans think the sun revolves around Europe, so I think we\\'re even.`,
					`Arab women can initiate a divorce if their husbands dont pour their coffee.`,
					`Whale hearts beat only 9 times a minute. By contrast, I beat my wife.`,
					`Clams change sex multiple times in their life. Wish I was a clam.`,
					`Hippos can run faster than people. Good luck.`,
					`It is impossible to sneeze with your eyes open, especially while using a urinal.`,
					`Half of all living people have never answered a phone call. Apparently my dad is one of them.`,
					`Dolphins sleep with one eye open. You should too, pal. Count your days.`,
					`Vacuum cleaners were originally horse-drawn. That was before God invented women.`,
					`Pandas poop out 24 pounds of shit a day, which is roughly the same amount my wife gives me in an hour.`,
					`Most power outages in the U.S. are caused by squirrels. This fact sponsored by Shellac of North America.`,
					`There are 26 bones in a human foot. However, I get only 1 boner when I see human feet.`
				]
				const fun_facts_commands = fun_facts.map(x => `summon item ~ ~ ~ {Item:{id:"minecraft:written_book",Count:1b,tag:{title:"Fun Facts",author:"",pages:['[{"text":"FUN FACT","color":"black","bold":true},{"text":": ${x}","color":"dark_gray","bold":false}]']}}}`)
				util.generateRandomScore("fact_index", fun_facts_commands.length, fun_facts_commands)
			},
			() => {
				const discs = ["cat", "blocks", "mall", "mellohi", "chirp", "pigstep", "ward", "far", "stal", "strad"]
				util.generateRandomScore("record_index", discs.length, (i) => {
					mc.command(`setblock ~ ~ ~ jukebox[has_record=true]{RecordItem:{id:"minecraft:music_disc_${discs[i]}",Count:1b}}`)
					mc.command(`playsound music_disc.${discs[i]} master @a ~ ~ ~`)
				})
			},
			() => {
				mc.execute().as("@p[distance=..10]").at("@s").run("pumpkin", () => {
					mc.command(`item replace entity @s armor.head with carved_pumpkin{display:{Name:'{"text":"p-p-p-p-pumpkin!","color":"gold","italic":false}',Lore:['{"text":"put it in my bumkin~","color":"gray","italic":false}']},Enchantments:[{id:"minecraft:binding_curse",lvl:1s}]}`)
					mc.command(`particle minecraft:totem_of_undying ~ ~1.85 ~ 0.2 0.2 0.2 0.01 60 force`)
					mc.command(`playsound block.wood.place master @a ~ ~ ~ 1 0.8`)
					mc.command(`tellraw @s {"text":"not in my eye - i'm a pumpkin!","color":"gold"}`)
				})
			},
			() => {
				mc.execute().as("@p[distance=..10]").at("@s").run("anvil", () => {
					mc.command(`tellraw @s "Ruh roh..."`)
					mc.command(`fill ~-1 ~-1 ~-1 ~1 ~-1 ~1 stone_bricks`)
					mc.command(`fill ~-1 ~ ~1 ~1 ~6 ~1 iron_bars`)
					mc.command(`fill ~-1 ~ ~-1 ~1 ~6 ~-1 iron_bars`)
					mc.command(`fill ~1 ~ ~ ~1 ~6 ~ iron_bars`)
					mc.command(`fill ~-1 ~ ~ ~-1 ~6 ~ iron_bars`)
					mc.command(`fill ~ ~ ~ ~ ~19 ~ air`)
					mc.command(`setblock ~ ~20 ~ anvil`)
				})
			},
			() => {
				mc.command(`tellraw @a[distance=..10] "Air strike incoming!!!"`)
				mc.execute().as("@p[distance=..10]").at("@s").run("airstrike", () => {
					for (let j = -1; j < 2; j++)
					{
						for (let i = 0; i < 9; i++)
							mc.command(`summon potion ~${-8 + (i * 2)} ~${42 + (2 * (j + i))} ~${j * 3} {Item:{id:"minecraft:splash_potion",Count:1b,tag:{Potion:"minecraft:harming"}}}`)
					}
				})
			},
			() => {
				mc.command(`tellraw @a[distance=..10] "I wouldn't open that if I were you..."`)
				mc.command(`fill ~-2 ~ ~-2 ~2 ~4 ~2 white_wool hollow`)
				for (let i = 0; i < 10; i++)
					mc.command(`summon cave_spider ~ ~3 ~`)
			},
			() => {
				mc.command("fill ~-1 ~ ~-1 ~1 ~2 ~1 diamond_block hollow")
				const fuses = [[80, 90, 1], 100, 100, 100, 110, 111, 114, 120, 120, 120, 121, 122, [140, 170, 5], 250]
				for (let i = 0; i < fuses.length; i++)
				{
					if (typeof fuses[i] == "number")
						mc.command(`summon tnt ~ ~ ~ {Fuse:${fuses[i]}}`)
					else
					{
						for (let n = fuses[i][0]; n <= fuses[i][1]; n += fuses[i][2])
							mc.command(`summon tnt ~ ~ ~ {Fuse:${n}}`)
					}
				}
			},
			() => {
				mc.command('summon armor_stand ~ ~ ~ {Tags:["chance_cube_armor_stand"]}')
				const itemTypes = ["boots", "leggings", "chestplate", "helmet"]
				const itemSlots = ["armor.feet", "armor.legs", "armor.chest", "armor.head", "weapon.mainhand"]
				const itemTiers = ["leather", "chainmail", "golden", "iron", "diamond"]
				const weapons = ["iron_sword", "iron_axe", "diamond_sword", "diamond_axe", "bow"]
				for (let i = 0; i < 5; i++)
				{
					util.generateRandomScore("chance_armor", 5)
					
					for (let j = 0; j < 5; j++)
					{
						let item = (i == 4) ? weapons[j] : `${itemTiers[j]}_${itemTypes[i]}`
						mc.execute().if(`score #chance_armor var matches ${j}`).run(`item replace entity @e[tag=chance_cube_armor_stand] ${itemSlots[i]} with ${item} 1`)
					}
				}
				mc.command("tag @e[tag=chance_cube_armor_stand] remove chance_cube_armor_stand")
			},
			() => {
				mc.command(`tellraw @a[distance=..20] {"text":"cookie-splosion!!!","color":"light_purple"}`)
				mc.command("playsound entity.generic.explode master @a ~ ~ ~ 1")
				mc.command("particle explosion ~ ~ ~ 0.3 0.3 0.3 0.1 3 force")
				for (let i = 0, tp = Math.PI * 2; i < tp; i += 0.1)
					mc.command(`summon item ~ ~ ~ {PickupDelay:10,Motion:[${(Math.cos(i) * 0.5).toFixed(4)},0.15,${(Math.sin(i) * 0.5).toFixed(4)}],Item:{id:"minecraft:cookie",Count:1b}}`)
			},
			() => {
				const catTypes = [1, 2, 3, 5, 8]
				mc.command(`tellraw @a[distance=..20] {"text":"it's raining cats and dogs!!!","color":"blue"}`)
				for (let i = 0, tp = Math.PI * 2; i < tp; i += 0.2)
				{
					let x = (Math.cos(i) * 0.5).toFixed(4);
					let z = (Math.sin(i) * 0.5).toFixed(4);
					mc.execute().positioned(`~${x} 240 ~${z}`).run("spawn", () => {
						mc.command("scoreboard players set #spawnedDog var 0")
						mc.execute().percent(35).run("dog", () => {
							mc.command("summon wolf ~ ~ ~ {CollarColor:9b}")
							mc.command("scoreboard players set #spawnedDog var 1")
						})
						mc.execute().if("score #spawnedDog var matches 0").run("cat", () => {
							util.generateRandomScore("spawn_cat", 5, (i) => {
								mc.command(`summon cat ~ ~ ~ {CatType:${catTypes[i]}}`)
							})
						})
					})
				}
			},
			() => {
				const r = 5
				for (let x = -r; x <= r; x++) {
					for (let y = -r; y <= r; y++) {
						for (let z = -r; z <= r; z++) {
							if (Math.sqrt(x*x+y*y+z*z) <= r) {
								mc.execute().positioned(mc.relativeCoords(x, y, z)).run("invert", () => {
									mc.setScore("#replacedBlock", "var", 0)
									const invert_blocks = [
										["#oyumod:dirt_or_grass", "stone"],
										["#oyumod:stone_variants", "dirt"],
										["#minecraft:logs", "oak_leaves"],
										["#minecraft:leaves", "oak_log"],
										["water", "chain_command_block"],
										["lava", "repeating_command_block"]
									]
									for (let i = 0; i < invert_blocks.length; i++) {
										mc.execute().if("score #replacedBlock var matches 0").if(`block ~ ~ ~ ${invert_blocks[i][0]}`).run(i + 1, () => {
											mc.command(`setblock ~ ~ ~ ${invert_blocks[i][1]}`)
											mc.setScore("#replacedBlock", "var", 1)
										})
									}
								})
							}
						}
					}
				}

				// replace liquids after so they dont instantly make obsidian
				mc.command(`execute at @s run fill ~-${r} ~-${r} ~-${r} ~${r} ~${r} ~${r} lava replace chain_command_block`)
				mc.command(`execute at @s run fill ~-${r} ~-${r} ~-${r} ~${r} ~${r} ~${r} water replace repeating_command_block`)
			},
			() => {
				mc.execute().at("@p").run("encase", () => {
					mc.command("setblock ~ ~-1 ~ obsidian")
					mc.command("setblock ~ ~2 ~ obsidian")
					mc.command("setblock ~1 ~ ~ obsidian")
					mc.command("setblock ~-1 ~ ~ obsidian")
					mc.command("setblock ~ ~ ~1 obsidian")
					mc.command("setblock ~ ~ ~-1 obsidian")
					mc.command("setblock ~1 ~1 ~ obsidian")
					mc.command("setblock ~-1 ~1 ~ obsidian")
					mc.command("setblock ~ ~1 ~1 obsidian")
					mc.command("setblock ~ ~1 ~-1 obsidian")
				})
			},
			() => {
				mc.command(`tellraw @a[distance=..10] "I myself am *very* experienced."`)
				for (let i = 0; i < 30; i++)
					mc.command(`summon experience_orb ~ ~ ~ {Value:1}`)
			},
			/*() => {
				mc.command(`tellraw @a[distance=..10] "Random item, random enchant, let's goooo"`)
				const items = 
			}
			*/
		]
	},
	init: () => {
		mc.shapedRecipe("chance_cube", ["###", "#N#", "###"], [["#", "lapis_lazuli"], ["N", "lapis_block"]], "structure_block", 1)

		mc.createFunction("summon-chance-cube", () => {
			mc.execute().align("xyz").positioned(mc.relativeCoords(0.5, -0.23, 0.5)).run(`summon armor_stand ~ ~-1 ~ {NoGravity:1b,Invulnerable:1b,Invisible:1b,Tags:["chance_cube_stand"],ArmorItems:[{},{},{},{id:"minecraft:player_head",Count:1b,tag:{SkullOwner:{Id:[I;-896039637,-980401696,-1319326211,1450294564],Properties:{textures:[{Value:"eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNjk1OGE0YTdhNTNkMzQzYmY2NzIyMTVhNDlmZGM5ZDdjYzQ0NGY2NTE2NmQxNjJjZDYwODcyZWI1ODcxMCJ9fX0="}]}}}}]}`)
			mc.command("setblock ~ ~ ~ cyan_stained_glass")
		})

		mc.hookAdvancement("place-chance-cube", "placed_block", {
			block: "minecraft:cyan_stained_glass",
			item: {nbt: "{chance_cube:1b}"}
		}, () => {
			mc.command("advancement revoke @s only chance-cubes:place-chance-cube")
			mc.setScore("#place_chance_cube_succ", "var", 0)
			mc.setScore("#max_recursion", "var", 0)
			// mc.command(`tellraw @a "raycasting.."`)
			mc.execute().anchored("eyes").run("loop", () => {
				mc.execute().positioned(mc.coords(0, 0, 0.02, mc.enums.COORDS_CARET)).if("block ~ ~ ~ cyan_stained_glass").align("xyz").positioned(mc.relativeCoords(0.5, -0.23, 0.5)).unless("entity @e[sort=nearest,type=armor_stand,tag=chance_cube_stand,distance=..0.1,limit=1]").positioned(mc.relativeCoords(0, 1, 0)).run("succ", () => {
					mc.command("function chance-cubes:summon-chance-cube")
					mc.setScore("#place_chance_cube_succ", "var", 1)
				// mc.command(`tellraw @a "raycasted!"`)
				})
				mc.addScore("#max_recursion", "var", 1)
				mc.execute().positioned(mc.coords(0, 0, 0.02, mc.enums.COORDS_CARET)).if("score #place_chance_cube_succ var matches 0").if("score #max_recursion var matches ..300").recurse()
			})

			// raycast didn't work -- brute force it
			mc.execute().if("score #place_chance_cube_succ var matches 0").run("brute", () => {
				// mc.command(`tellraw @a "brute forcing..."`)
				let dim = 6
				for (let x = -dim; x <= dim; x++) {
					for (let y = -dim; y <= dim; y++) {
						for (let z = -dim; z <= dim; z++) {
							if (x*x + y*y + z*z <= dim*dim) {
								mc.execute().if("score #place_chance_cube_succ var matches 0").positioned(mc.relativeCoords(x, y, z)).if("block ~ ~ ~ cyan_stained_glass").align("xyz").positioned(mc.relativeCoords(0.5, -0.23, 0.5)).unless("entity @e[sort=nearest,type=armor_stand,tag=chance_cube_stand,distance=..0.1,limit=1]").positioned(mc.relativeCoords(0, 1, 0)).run("succ", () => {
									mc.command("function chance-cubes:summon-chance-cube")
									// mc.command(`tellraw @a "brute forced!"`)
									mc.setScore("#place_chance_cube_succ", "var", 1)
								})
							}
						}
					}
				}
			})
		})

		mc.hookAdvancement("craft-chance-cube", "inventory_changed", {
			items: [{item: "minecraft:structure_block"}]
		}, () => {
			mc.command("tag @s add crafted_chance_cube")
			mc.command("advancement revoke @s only chance-cubes:craft-chance-cube")
		})

		// TODO: allow mods to add chance cube outcomes
	},
	["tick-players"]: data => {
		// give the crafted chance cubes
		mc.execute().as("@s[tag=crafted_chance_cube]").run("craft-chance", () => {
			mc.execute().store("result score #crafted_chance_cube var").run("clear @s structure_block")
			mc.execute().if("score #crafted_chance_cube var matches 1..").run("give-cube", () => {
				mc.command(`give @s cyan_stained_glass${util.chance_cube_nbt}`)
				mc.subtractScore("#crafted_chance_cube", "var", 1)
				mc.execute().if("score #crafted_chance_cube var matches 1..").recurse()
			})
			mc.command("tag @s remove crafted_chance_cube")
		})

		// magic charms
		mc.execute().if("data entity @s SelectedItem.tag.charm").run("charm", () => {
			mc.execute().if("data entity @s SelectedItem.tag.charm_regen").run("effect give @e[distance=..5] regeneration 2 0 true")
		})
	},
	["tick-entities"]: data => {
		// armor stand tick
		mc.execute().as("@s[type=armor_stand]").run("stand", () => {
			// chance cube broken
			mc.execute().as("@s[tag=chance_cube_stand]").positioned(mc.relativeCoords(0, 1.8, 0)).unless("block ~ ~ ~ cyan_stained_glass").run("chance", () => {
				util.generateRandomScore("chance_cube", data.outcomes.length, data.outcomes)
				mc.command("kill @s")
			})

			// ascending statues
			mc.execute().as("@s[tag=ascending]").run("ascend", () => {
				mc.command("teleport @s ~ ~0.1 ~ ~ ~")
				mc.execute().as("@s[y=300,dy=10]").run("kill @s")
			})
		})
	}
}