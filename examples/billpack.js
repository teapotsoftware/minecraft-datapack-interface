
const DATAPACK_DIR = "C:/Users/Nick/AppData/Roaming/.minecraft/saves/billpack-testing/datapacks"
const DATAPACK_FORMAT = 7

const fs = require("fs")
const util = require("util")
const mc = require("./../mcdpi")
const midiParser = require("./lib/midi-parser/main")

// parse midi file into commands to play the midi file
function addJukeboxSong(fileName, name, tracks = [{track: 0, instrument: "harp"}], dtTicks = 1, volumeMultiplier = 1.0)
{
	let data = fs.readFileSync(`./${fileName}.mid`, "base64")
	let midi = midiParser.parse(data)

	for (let track = 0; track < tracks.length; track++)
	{
		// deltaTime fix
		let totalDeltaTime = 0
		let eventList = []
		for (let i = 0; i < midi.track[tracks[track].track].event.length; i++)
		{
			totalDeltaTime += midi.track[tracks[track].track].event[i].deltaTime
			let evnt = midi.track[tracks[track].track].event[i]
			evnt.deltaTime = totalDeltaTime
			eventList.push(totalDeltaTime)
		}

		// create timer
		mc.createTimerFunction(`midi-${name}-${tracks[track].track}`, midi.track[tracks[track].track].event.length, dtTicks, false, (i) => {
			let played = false
			for (let j = 0; j < midi.track[tracks[track].track].event.length; j++)
			{
				// note on event
				if (midi.track[tracks[track].track].event[j].type == 9 && midi.track[tracks[track].track].event[j].deltaTime == i)
				{
					let d = midi.track[track].event[j].data
					let pitch = 0.5 + ((d[0] / 127) * 1.5)
					let volume = (d[1] / 127) * volumeMultiplier
					mc.command(`playsound block.note_block.${tracks[track].instrument} master @a ~ ~ ~ ${volume.toFixed(4)} ${pitch.toFixed(4)} ${volume.toFixed(4)}`)
					played = true
				}
			}
			console.log(midi.track[tracks[track].track].event[i])
			if (played)
				console.log(`#${i} is GOOD!!!`)
			return played
		}, true)

		console.log(`TRACK ${track}:`)
		console.log(midi.track[tracks[track].track].event)
	}
}

// helper function - generates a random int in [0, max)
// not really sure if its evenly distributed but i dont care
function generateRandomScore(name, max, f = null)
{
	mc.command(`scoreboard players set #${name} var 0`)
	for (let i = 0, n = Math.ceil(Math.log2(max)) + 2; i < n; i++)
		mc.execute().percent(50).run(`scoreboard players add #${name} var ${Math.pow(2, i)}`)
	mc.command(`scoreboard players set #${name}_max var ${max}`)
	mc.command(`scoreboard players operation #${name} var %= #${name}_max var`)

	// optional parameter to actually do something with the generated random
	if (f != null)
	{
		for (let i = 0; i < max; i++)
		{
			if (typeof f == "function")
			{
				// function thats called for every value in the range
				mc.execute().if(`score #${name} var matches ${i}`).run(i + 1, () => {
					f(i)
				})
			}
			else
			{
				// otherwise assume an array of the different random outcomes
				if (typeof f[i] == "string")
				{
					mc.execute().if(`score #${name} var matches ${i}`).run(f[i])
				}
				else if (typeof f[i] == "function")
				{
					mc.execute().if(`score #${name} var matches ${i}`).run(i + 1, () => {
						f[i]()
					})
				}
				else
				{
					// assume an array of strings
					mc.execute().if(`score #${name} var matches ${i}`).run(i + 1, () => {
						for (let j = 0, n = f[i].length; j < n; j++)
							mc.command(f[i][j])
					})
				}
			}
		}
	}
}

function debugMsg(txt) {mc.command(`tellraw @a {"text":"[debug] ${txt}","color":"dark_aqua"}`)}

const chance_cube_nbt = `{Enchantments:[{id:-1}],display:{Name:'{"text":"Chance Cube","color":"#00539C","bold":true,"italic":false}',Lore:['{"text":"Please don\\'t open this near","color":"gray","italic":false}','{"text":"anything valuable, ok?","color":"gray","italic":false}','{"text":"UNSTABLE: PLACE DELIBERATELY","color":"dark_red","bold":true,"italic":false}']},chance_cube:1b}`
const drums = ["kick", "hat1", "snare", "hat2"]

let ModList = [
	{ // join messages
		id: "join-messages",
		name: "Join Messages",
		desc: "Welcome messages for new and returning players.",
		hideInList: true,
		["welcome-new"]: () => {
			mc.command('tellraw @a [{"text":"Welcome ","color":"white"},{"selector":"@s","color":"yellow"},{"text":" to the server!","color":"white"}]')
		},
		["welcome-returning"]: () => {
			mc.command('tellraw @s [{"text":"Welcome back, ","color":"white"},{"selector":"@s","color":"yellow"},{"text":"!","color":"white"}]')
		}
	},
	{ // songs
		id: "songs",
		name: "Nick's Jukebox",
		desc: "MIDI songs imported into Minecraft.",
		init: () => {
			// add jukebox songs
			addJukeboxSong("songs/test3", "testsong", [{track: 1, instrument: "harp"}])
		}
	},
	{ // hitsounds
		id: "hitsounds",
		name: "Hit Sounds",
		desc: "Play a sound when you do damage to mobs or players.",
		hideInList: true,
		data: {
			item_hitsounds: [
				["bone", "block.bone_block.place", 1.1],
				["stick", "block.wood.break", 2],
				[["porkchop", "beef", "mutton", "chicken", "rabbit"], "entity.slime.squish_small", 0.9],
				[["cod", "salmon", "tropical_fish", "pufferfish"], "entity.slime.squish_small", 1.1],
			],

			custom_hitsounds: [
				["block.grass.break", 2],
				["entity.experience_orb.pickup", 2],
				["block.note_block.bit", 1],
				["block.note_block.basedrum", 2],
				["block.note_block.snare", 1],
				["block.note_block.chime", 1],
				["block.note_block.cow_bell", 1],
			]
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
						mc.command("tag @s[tag=drum_" + drums[i] + ",tag=!drum_" + drums[(i + 3) % 4] + "] add drum_" + drums[(i + 1) % 4])
					for (let i = 0; i < 4; i++)
						mc.command("tag @s[tag=drum_" + drums[i] + ",tag=drum_" + drums[(i + 1) % 4] + "] remove drum_" + drums[i])
				})

				// if not drumming, use preferred hitsound
				mc.execute().as("@s[tag=!drummer]").run("switch", () => {

					// item hitsounds (bone goes *bonk*)
					for (let i = 0; i < data.item_hitsounds.length; i++)
					{
						if (typeof data.item_hitsounds[i][0] == "string")
							mc.execute().as(`@s[nbt={SelectedItem:{id:"minecraft:${data.item_hitsounds[i][0]}"}}]`).run(`playsound ${data.item_hitsounds[i][1]} master @a ~ ~ ~ 1 ${data.item_hitsounds[i][2]}`)
						else
						{
							for (let j = 0; j < data.item_hitsounds[i][0].length; j++)
								mc.execute().as(`@s[nbt={SelectedItem:{id:"minecraft:${data.item_hitsounds[i][0][j]}"}}]`).run(`playsound ${data.item_hitsounds[i][1]} master @a ~ ~ ~ 1 ${data.item_hitsounds[i][2]}`)
						}
					}

					// preferred hitsound
					mc.execute().as("@s[scores={hitsound=8..}]").run("scoreboard players set @s hitsound 0")
					for (let i = 0; i < data.custom_hitsounds.length; i++)
						mc.execute().as("@s[scores={hitsound=" + (i + 1) + "}]").run("playsound " + data.custom_hitsounds[i][0] + " master @s ~ ~ ~ 1 " + data.custom_hitsounds[i][1])
				})

				// return to normal
				mc.command("tag @s remove drummer")
				mc.command("advancement revoke @s only hitsounds:hitsound")
			})
		},
		load: () => {
			// objectives
			mc.addObjective("play_hitsound", "minecraft.custom:minecraft.damage_dealt")
			mc.addObjective("hitsound", "trigger")
		},
		["tick-players"]: () => {
			// re-enable hitsound change trigger
			mc.command("scoreboard players enable @s hitsound")
		}
	},
	{ // vanilla tweaks
		id: "vanilla-tweaks",
		name: "Vanilla tweaks",
		desc: "Miscellaneous small improvements, e.g. endermen always dropping 1 pearl.",
		hideInList: true,
/*
		["tick-players"]: () => {

			// buffed gold armor - full set applies fire resistance
			// disabled because gay
			// mc.execute().as('@s[nbt={Inventory:[{id:"minecraft:golden_boots",Slot:100b},{id:"minecraft:golden_leggings",Slot:101b},{id:"minecraft:golden_chestplate",Slot:102b},{id:"minecraft:golden_helmet",Slot:103b}]}]').run("effect give @s fire_resistance 1 0 true")
		},
*/
		["tick-entities"]: () => {

			// zombie tick
			mc.execute().as("@s[type=zombie]").run("zombie", () => {

				// convert zombies suffocating in sand to husks
				mc.execute().if("block ~ ~ ~ sand").if("block ~ ~1 ~ sand").run("turntohusk", () => {
					mc.command("summon husk")
					mc.command("kill @s")
				})

				// zombies rise from the earth
				mc.execute().if("block ~ ~ ~ #billpack:dirt_or_grass").run("emerge", () => {
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

			// endermen always drop 1 pearl
			mc.execute().as("@s[type=enderman]").run('data merge entity @s {DeathLootTable:"empty",ArmorItems:[{},{},{id:"minecraft:ender_pearl",Count:1b},{}],ArmorDropChances:[0.085F,0.085F,1.000F,0.085F]}')
		},
		["tick-entities-fresh-item"]: () => {

			// fresh flesh can summon zombies from the ground
			mc.execute().as('@s[nbt={Item:{id:"minecraft:rotten_flesh"}}]').percent(50).run("resur", () => {
				mc.execute().if("block ~ ~-3 ~ #billpack:dirt_or_grass").if("block ~ ~-2 ~ #billpack:dirt_or_grass").if("block ~ ~-1 ~ #billpack:dirt_or_grass").run("zombie", () => {
					mc.execute().positioned(mc.relativeCoords(0, -2.6, 0)).run("summon zombie")
				})
				mc.execute().if("block ~ ~-3 ~ #minecraft:sand").if("block ~ ~-2 ~ #minecraft:sand").if("block ~ ~-1 ~ #minecraft:sand").run("husk", () => {
					mc.execute().positioned(mc.relativeCoords(0, -2.6, 0)).run("summon husk")
				})
			})
		},
		["tick-entities-fresh-trader"]: () => {

			// cheap soups
			mc.execute().percent(33).run(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:emerald",Count:1b},sell:{id:"minecraft:mushroom_stew",Count:1b,tag:{display:{Name:'{"text":"Chocolate Ice Cream","italic":false}'}}}}`)
			mc.execute().percent(33).run(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:emerald",Count:1b},sell:{id:"minecraft:beetroot_soup",Count:1b,tag:{display:{Name:'{"text":"Tomato Soup","italic":false}'}}}}`)
			mc.execute().percent(33).run(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:emerald",Count:1b},sell:{id:"minecraft:rabbit_stew",Count:1b,tag:{display:{Name:'{"text":"Pad Thai","italic":false}'}}}}`)
			mc.execute().percent(33).run(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:emerald",Count:1b},sell:{id:"minecraft:pumpkin_pie",Count:1b,tag:{display:{Name:'{"text":"Cheesecake","italic":false}'}}}}`)
		}
	},
	{ // extra mobs
		id: "extra-mobs",
		name: "Extra mobs",
		desc: "Special mobs that spawn under certain conditions.",
		hideInList: true,
		init: () => {
			mc.addTag(mc.tagType.blocks, "disposable_blocks", ["#minecraft:logs", "#minecraft:leaves", "#minecraft:enderman_holdable", "minecraft:air"])
			mc.addTag(mc.tagType.entities, "armor_wearing_mobs", ["#minecraft:skeletons", "minecraft:zombie", "minecraft:husk"])
		},
		["tick-entities-fresh"]: () => {

			// freshly-spawned zombies and skeletons
			mc.execute().as("@s[type=#extra-mobs:armor_wearing_mobs]").run("skelezomb", () => {

				// 40% to have a raincoat in the rain
				mc.execute().predicate("raining").if("block ~ ~-1 ~ grass_block").percent(40).run(`data modify entity @s ArmorItems[2] set value {id:"minecraft:leather_chestplate",Count:1b,tag:{display:{Name:\'{"text":"Raincoat","color":"yellow","italic":false}\',Enchantments:[{id:-1}],color:16383821}}}`)

				// buffed "paladins" in strongholds
				mc.execute().percent(60).if("block ~ ~-1 ~ #stone_bricks").run("paladin", () => {
					mc.command('data merge entity @s {ArmorItems:[{id:"minecraft:golden_boots",Count:1b},{id:"minecraft:golden_leggings",Count:1b},{id:"minecraft:golden_chestplate",Count:1b},{id:"minecraft:golden_helmet",Count:1b}]}')
					mc.execute().as("@s[type=zombie]").percent(60).run('data merge entity @s {HandItems:[{id:"minecraft:golden_axe",Count:1b,tag:{Enchantments:[{id:"minecraft:sharpness",lvl:3s}]}},{}]}')
				})

				// wear a helmet in space (y level 250-330)
				mc.execute().as("@s[y=290,dy=40]").run("space", () => {
					mc.command('data modify entity @s ArmorItems[3] set value {id:"minecraft:glass",Count:1b}')
					mc.command("data modify entity @s ArmorDropChances[3] set value 0F")
				})

				// zombie with drum sticks
				mc.execute().as("@s[type=zombie]").percent(1).run("drummer", () => {
					for (let i = 0; i < 2; i++)
						mc.command(`data modify entity @s HandItems[${i}] set value {id:"minecraft:stick",Count:1b,tag:{display:{Name:\'{"text":"Drumsticks","color":"dark_aqua","italic":false}\'},drumsticks:1b,AttributeModifiers:[{AttributeName:"generic.attackDamage",Name:"generic.attackDamage",Amount:2,Operation:0,UUIDLeast:497392,UUIDMost:2711,Slot:"mainhand"},{AttributeName:"generic.attackDamage",Name:"generic.attackDamage",Amount:2,Operation:0,UUIDLeast:352537,UUIDMost:892164,Slot:"offhand"}]}}`)
					mc.command("data modify entity @s HandDropChances set value [1.0f, 1.0f]")
				})

				// skeleton with trumpet *DOOT DOOT*
				mc.execute().as("@s[type=skeleton]").percent(1).run("trumpet", () => {
					mc.command(`data modify entity @s HandItems[0] set value {id:"minecraft:golden_horse_armor",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:\'{"text":"Trumpet","color":"gold","italic":false}\'},Enchantments:[{id:-1}],instrument:1b,instrument_didgeridoo:1b}}`)
					mc.command("data modify entity @s HandDropChances[0] set value 1.0f")
				})
			})

			// freshly-spawned creepers
			mc.execute().as("@s[type=creeper]").run("creeper", () => {

				// bride & groom
				mc.execute().as("@s[type=creeper]").percent(0.5).run("wedding", () => {
					mc.command('summon zombie ~ ~ ~ {HandItems:[{id:"minecraft:poppy",Count:1b},{}],HandDropChances:[1.000F,0.085F],ArmorItems:[{id:"minecraft:leather_boots",Count:1b,tag:{display:{color:0}}},{id:"minecraft:leather_leggings",Count:1b,tag:{display:{color:0}}},{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{color:0}}},{}],ArmorDropChances:[0.000F,0.000F,0.000F,0.085F]}')
					mc.command('summon skeleton ~ ~ ~ {HandItems:[{id:"minecraft:bow",Count:1b,tag:{display:{Name:\'{"text":"Bridal Bow","color":"light_purple","italic":false}\'},Enchantments:[{id:"minecraft:power",lvl:1s}]}},{}],HandDropChances:[2.000F,0.085F],ArmorItems:[{},{id:"minecraft:leather_leggings",Count:1b,tag:{display:{color:16777215}}},{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{color:16777215}}},{id:"minecraft:white_stained_glass",Count:1b}],ArmorDropChances:[0.085F,0.000F,0.000F,0.000F]}')
				})

				// herobrine shrine
				mc.execute().as("@s[type=creeper]").if("entity @p[distance=..80]").if("score #spawn_heroshrine var matches 1").run("shrinecheck", () => {

					// make sure a 3x3x3 is clear
					mc.setScore("#canSpawnShrine", "var", 1)
					for (let y = 0; y < 3; y++)
					{
						for (let x = -1; x < 2; x++)
						{
							for (let z = -1; z < 2; z++)
								mc.execute().unless("block " + mc.relativeCoords(x, y, z) + " #extra-mobs:disposable_blocks").run("scoreboard players set #canSpawnShrine var 0")
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

			// heroshrine core destroyed
			mc.execute().as('@s[nbt={Item:{id:"minecraft:mossy_cobblestone"}}]').if("block ~ 0 ~ light_gray_wool").run("shtf", () => {
				mc.command("setblock ~ 0 ~ bedrock")
				mc.command("particle cloud ~ ~ ~ 0 0 0 0.01 3 force")
				mc.command("playsound ambient.cave master @a ~ ~ ~ 1 2")
				mc.command("kill @s")
			})
		}
	},
	{ // musical instruments
		id: "musical-instruments",
		name: "InstruMod v2",
		desc: "Instrument items that play random notes when held.",
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
			]
		},
		load: () => {
			mc.setScore("#instrument_cooldown", "var", 0)
		},
		tick: () => {

			// instrument note cooldown
			mc.command("scoreboard players add #instrument_cooldown var 1")
			mc.execute().if("score #instrument_cooldown var matches 5..").run("scoreboard players set #instrument_cooldown var 0")
		},
		["tick-players"]: data => {
			// .if("score #instrument_cooldown var matches 0")
			mc.execute().if("data entity @s SelectedItem.tag.instrument").percent(35).run("instrument", () => {
				mc.execute().store("result score #ply_ang var").run("data get entity @s Rotation[1]")
				mc.addScore("#ply_ang", "var", 90)
				mc.command("particle note ^-0.4 ^1 ^ 0 0 0 0.1 1 force")

				for (let i in data.instruments)
				{
					mc.execute().if(`data entity @s SelectedItem.tag.instrument_${data.instruments[i]}`).run(data.instruments[i], () => {
						let cmds = []
						for (let n = 0; n < 36; n++)
						{
							let top = ((n + 1) * 5)
							if (top < 180)
								top--

							// mc.execute().if("score #ply_ang var matches " + (n * 5) + ".." + top).run(`playsound block.note_block.${data.instruments[i]} master @a ~ ~ ~ 1 ${2 - ((n / 35) * 1.5)}`)
							cmds.push(`playsound block.note_block.${data.instruments[i]} master @a ~ ~ ~ 1 ${2 - ((n / 35) * 1.5)}`)
						}
						generateRandomScore("instrument_note", 36, cmds)
					})
				}
			})
		},
		["tick-entities-fresh-trader"]: () => {

			// buyable instruments
			const desc = "Look up & down to change pitch."
			mc.execute().percent(25).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:10b},sell:{id:"minecraft:golden_horse_armor",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:'{"text":"Saxophone","color":"gold","italic":false}',Lore:['{"text":"${desc}","color":"gray","italic":false}']},instrument:1b,instrument_didgeridoo:1b}}}`)
			mc.execute().percent(25).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:10b},sell:{id:"minecraft:bone",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:'{"text":"Xylobone","color":"aqua","italic":false}',Lore:['{"text":"${desc}","color":"gray","italic":false}']},instrument:1b,instrument_xylophone:1b}}}`)
			mc.execute().percent(25).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:10b},sell:{id:"minecraft:iron_ingot",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:'{"text":"MC-600 Synthesizer","color":"dark_red","italic":false}',Lore:['{"text":"${desc}","color":"gray","italic":false}']},instrument:1b,instrument_bit:1b}}}`)
			mc.execute().percent(25).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:10b},sell:{id:"minecraft:bowl",Count:1b,tag:{Enchantments:[{id:-1}],display:{Name:'{"text":"Singing Bowl","color":"dark_green","italic":false}',Lore:['{"text":"${desc}","color":"gray","italic":false}']},instrument:1b,instrument_chime:1b}}}`)
		}
	},
	{ // chance cubes
		id: "chance-cubes",
		name: "Chance Cubes",
		desc: "Blocks crafted from lapis that do something random when broken.",
		data: {
			outcomes: [
				`tellraw @a[distance=..10] "Nothing!"`,
				`summon creeper ~ ~ ~ {Fuse:0,ExplosionRadius:30,CustomName:'{"text":"Red Matter Explosion","color":"red"}'}`,
				`summon wither ~ ~ ~ {CustomName:'{"text":"Robert"}'}`,
				`summon wither ~ ~ ~ {CustomName:'{"text":"Al-Guru"}',Health:1f,Attributes:[{Name:generic.max_health,Base:1}]}`,
				`summon minecart ~ ~ ~ {CustomNameVisible:1b,Passengers:[{id:"minecraft:creeper",ExplosionRadius:7b,Fuse:10,ActiveEffects:[{Id:14b,Amplifier:0b,Duration:200,ShowParticles:0b}]}],CustomName:'{"text":"The Death Cab","color":"dark_red","italic":false}'}`,
				`execute as @a[distance=..20] at @s positioned ^ ^ ^-1.5 run playsound entity.creeper.primed hostile @s ~ ~ ~`,
				`setblock ~ ~ ~ bedrock`,
				`summon item ~ ~ ~ {PickupDelay:10,Item:{id:"iron_shovel",Count:1b,tag:{display:{Name:'{"text":"Bug Swatter","color":"#33FFCF","italic":false}'},Enchantments:[{id:"minecraft:bane_of_arthropods",lvl:5s}],AttributeModifiers:[{AttributeName:"generic.attack_speed",Name:"generic.attack_speed",Amount:3,Operation:0,UUIDLeast:143398,UUIDMost:173422,Slot:"mainhand"}]}}}`,
				`summon item ~ ~ ~ {PickupDelay:10,Item:{id:"stick",Count:1b}}`,
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
				[
					`summon item ~ ~ ~ {Item:{id:"minecraft:carrot_on_a_stick",Count:1b,tag:{display:{Name:'{"text":"AR-15","color":"white","italic":false}'},HideFlags:4,Unbreakable:1b,CustomModelData:12490002,special_coas:1b,gun:1b,gun_auto:1b}}}`,
					`summon item ~ ~ ~ {Item:{id:"minecraft:iron_nugget",Count:64b,tag:{display:{Name:'{"text":"Cartridge","color":"white","italic":false}'},CustomModelData:12490001}}}`,
					`tellraw @a[distance=..10] {"color":"dark_gray","text":"All the other kids with the pumped up kicks..."}`
				],
				() => {
					mc.command(`tellraw @a[distance=..10] "I heard you like chance cubes, so I put chance cubes in your chance cube..."`)
					for (let i = 0; i < 3; i++)
						mc.command(`summon item ~ ~ ~ {Item:{id:"minecraft:cyan_stained_glass",Count:1b,tag:${chance_cube_nbt}}}`);
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
						`Pearls melt in vinegar.`,
						`35% of married people in advertisements are actually married for real.`,
						`Elephants can stand on their head.`,
						`Only 55% of Americans know the sun is a star.`,
						`Arab women can initiate a divorce if their husbands dont pour their coffee.`,
						`Whale hearts beat only 9 times a minute. My wife is also beat 9 times a minute.`,
						`Clams change sex multiple times in their life.`,
						`Hippos can run faster than people. You cant run.`,
						`It is impossible to sneeze with your eyes open.`,
						`Half of all living people have never received a phone call.`,
						`Dolphins sleep with one eye open. You should too, pal. Count your days.`,
						`Vacuum cleaners were originally horse-drawn.`,
						`Pandas poop out 24 pounds of shit a day, which is roughly the same amount my wife gives me in an hour.`,
						`Most power outages in the U.S. are caused by squirrels. Steve Albini came prepared!`,
						`There are 26 bones in a human foot. However, I get only 1 boner when I see feet.`
					]
					const fun_facts_commands = fun_facts.map(x => `summon item ~ ~ ~ {Item:{id:"minecraft:written_book",Count:1b,tag:{title:"Fun Facts",author:"",pages:['[{"text":"FUN FACT","color":"black","bold":true},{"text":": ${x}","color":"dark_gray","bold":false}]']}}}`)
					generateRandomScore("fact_index", fun_facts_commands.length, fun_facts_commands)
				},
				() => {
					const discs = ["cat", "blocks", "mall", "mellohi", "chirp", "pigstep", "ward", "far", "stal", "strad"]
					generateRandomScore("record_index", discs.length, (i) => {
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
						generateRandomScore("chance_armor", 5)
						
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
								generateRandomScore("spawn_cat", 5, (i) => {
									mc.command(`summon cat ~ ~ ~ {CatType:${catTypes[i]}}`)
								})
							})
						})
					}
				},
				() => {
					const r = 5
					for (let x = -r; x <= r; x++)
					{
						for (let y = -r; y <= r; y++)
						{
							for (let z = -r; z <= r; z++)
							{
								if (Math.sqrt(x*x+y*y+z*z) <= r)
								{
									mc.execute().positioned(mc.relativeCoords(x, y, z)).run("invert", () => {
										mc.setScore("#replacedBlock", "var", 0)
										const invert_blocks = [
											["#billpack:dirt_or_grass", "stone"],
											["#billpack:stone_variants", "dirt"],
											["#minecraft:logs", "oak_leaves"],
											["#minecraft:leaves", "oak_log"],
											["water", "chain_command_block"],
											["lava", "repeating_command_block"]
										]
										for (let i = 0; i < invert_blocks.length; i++)
										{
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
					for (let x = -dim; x <= dim; x++)
					{
						for (let y = -dim; y <= dim; y++)
						{
							for (let z = -dim; z <= dim; z++)
							{
								if (x*x + y*y + z*z <= dim*dim)
								{
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
				items: [
					{
						item: "minecraft:structure_block",
					}
				],
			}, () => {
				mc.command("tag @s add crafted_chance_cube")
				mc.command("advancement revoke @s only chance-cubes:craft-chance-cube")
			})

/*
			mc.hookAdvancement("craft-chance-cube", "recipe_unlocked", {
				recipe: "billpack:chance_cube",
			}, () => {
				mc.command("tag @s add crafted_chance_cube")
				mc.command("advancement revoke @s only billpack:craft-chance-cube")
			})
*/

			// TODO: allow mods to add chance cube outcomes
		},
		["tick-players"]: data => {

			// give the crafted chance cubes
			mc.execute().as("@s[tag=crafted_chance_cube]").run("craft-chance", () => {
				mc.execute().store("result score #crafted_chance_cube var").run("clear @s structure_block")
				mc.execute().if("score #crafted_chance_cube var matches 1..").run("give-cube", () => {
					mc.command(`give @s cyan_stained_glass${chance_cube_nbt}`)
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
					generateRandomScore("chance_cube", data.outcomes.length, data.outcomes)
					mc.command("kill @s")
				})

				// ascending statues
				mc.execute().as("@s[tag=ascending]").run("ascend", () => {
					mc.command("teleport @s ~ ~0.1 ~ ~ ~")
					mc.execute().as("@s[y=300,dy=10]").run("kill @s")
				})
			})
		}
	},
	{ // guns
		id: "guns",
		name: "Nick's Carrot-Stick-Guns",
		desc: "Guns that use iron nuggets for ammo, and can be fired by right-clicking.",
		init: () => {
			mc.addTag(mc.tagType.blocks, "gun_breakable", ["minecraft:grass", "minecraft:tall_grass", "minecraft:fern", "minecraft:dead_bush", "minecraft:snow", "#minecraft:flowers"])
		},
		load: () => {
			mc.addObjective("musket_cooldown", "dummy")
			mc.addObjective("carrot_stick", "minecraft.used:minecraft.carrot_on_a_stick")
		},
		["tick-players"]: () => {
			mc.execute().as("@s[scores={carrot_stick=1..}]").run("carrot", () => {

				// faster test
				mc.execute().if("data entity @s SelectedItem.tag.special_coas").run("special", () => {

					// slime staff
					mc.execute().as('@s[nbt={SelectedItem:{tag:{gun_slime:1b}},Inventory:[{id:"minecraft:slime_ball"}]}]').run("slime", () => {
						mc.command("clear @s[gamemode=!creative] slime_ball 1")
						mc.setScore("#gun", "var", 0)
						mc.setScore("#gun_succ", "var", 0)
						mc.command("playsound entity.arrow.shoot master @a ~ ~ ~ 1 1.2")
						mc.command("tag @s add gun_shooter")
						mc.execute().anchored("eyes").run("loop", () => {
							mc.command("particle sneeze ~ ~ ~ 0.1 0.1 0.1 0.01 1 force")
							mc.command("scoreboard players add #gun var 1")
							mc.execute().if("score #gun var matches 40").run("scoreboard players set #gun_succ var 1")
							mc.execute().unless("block ^ ^ ^0.3 #billpack:air").run("scoreboard players set #gun_succ var 1")
							mc.execute().if("entity @e[type=!item,tag=!gun_shooter,limit=1,sort=nearest,dx=0,dy=0,dz=0]").run("scoreboard players set #gun_succ var 1")
							mc.execute().if("score #gun_succ var matches 1").run("succ", () => {
								mc.command("effect give @e[distance=..2] slowness 5 2 true")
								mc.command("particle sneeze ~ ~ ~ 0.6 0.6 0.6 0.01 100 force")
								mc.command("playsound entity.slime.squish master @a ~ ~ ~ 1 0.8")
							})
							mc.execute().if("score #gun var matches ..40").if("score #gun_succ var matches 0").positioned(mc.coords(0, 0, 0.4, mc.enums.COORDS_CARET)).recurse()
						})
						mc.command("tag @s remove gun_shooter")
					})

					// blaze-powered flamethrower
					mc.execute().as('@s[nbt={SelectedItem:{tag:{gun_flame:1b}},Inventory:[{id:"minecraft:blaze_powder"}]}]').run("flamethrower", () => {
						mc.command("clear @s[gamemode=!creative] blaze_powder 1")
						mc.setScore("#gun", "var", 0)
						mc.setScore("#gun_succ", "var", 0)
						mc.command("playsound minecraft:entity.ghast.shoot master @a ~ ~ ~ 1 0.8")
						mc.execute().anchored("eyes").run("loop", () => {
							mc.command("particle flame ~ ~ ~ 0.1 0.1 0.1 0.01 3 force")
							mc.command("scoreboard players add #gun var 1")
							mc.execute().unless("block ^ ^ ^0.3 #billpack:air").run("scoreboard players set #gun_succ var 1")
							mc.execute().if("score #gun_succ var matches 1").run("succ", () => {
								mc.command("setblock ~ ~ ~ fire")
								mc.command("particle flame ~ ~ ~ 0.2 0.2 0.2 0.01 100 force")
							})
							mc.execute().if("score #gun var matches ..80").if("score #gun_succ var matches 0").positioned(mc.coords(0, 0, 0.2, mc.enums.COORDS_CARET)).recurse()
						})
					})

					// if they haven't used a musket yet, set it up here
					mc.execute().store("success score #temp var").run("scoreboard players get @s musket_cooldown")
					mc.execute().if("score #temp var matches 0").run("scoreboard players set @s musket_cooldown 0")

					// bullet shooters - auto and musket
					for (let i = 0; i < 2; i++)
					{
						let musket = (i == 0)
						let name = (musket ? "musket" : "auto")
						mc.execute().as('@s[nbt={SelectedItem:{tag:{gun_' + name + ':1b}},Inventory:[{id:"minecraft:iron_nugget"}]}]' + (musket ? ' if score @s musket_cooldown matches ..0' : "")).run(name, () => {
							mc.command("clear @s[gamemode=!creative] iron_nugget 1")
							mc.setScore("#gun", "var", 0)
							mc.setScore("#gun_succ", "var", 0)
							mc.command("particle cloud ^-0.6 ^1.4 ^0.6 0.02 0 0.02 0.02 1 force")
							mc.command("playsound entity.generic.explode master @a ~ ~ ~ 1 1.7")
							mc.command("tag @s add gun_shooter")

							if (musket)
								mc.setScore("musket_cooldown", 30)

							mc.execute().anchored("eyes").run("loop", () => {

								// block collision check
								mc.setScore("#bullet_blocked", "var", 0)
								mc.execute().unless("block ^ ^ ^0.4 #billpack:air").unless("block ^ ^ ^0.4 water").run("scoreboard players set #bullet_blocked var 1")

								// break plants
								mc.execute().if("score #bullet_blocked var matches 1").if("block ^ ^ ^0.4 #guns:gun_breakable").run("break", () => {
									mc.command("setblock ^ ^ ^0.4 air destroy")
									mc.setScore("#bullet_blocked", "var", 0)
								})

								// tracer particle
								// mc.execute().unless("block ~ ~ ~ water").run("particle crit ~ ~ ~ 0.1 0.1 0.1 0.01 1 force")
								mc.execute().if("block ~ ~ ~ water").run("particle bubble ~ ~ ~ 0.1 0.1 0.1 0.01 1 force")

								// hit target check
								mc.execute().if("entity @e[limit=1,sort=nearest,tag=!gun_shooter,type=!item,dx=0,dy=0,dz=0]").run("scoreboard players set #gun_succ var 1")
								mc.execute().if("score #gun_succ var matches 1").as("@e[tag=!gun_shooter,type=!item,dx=0,dy=0,dz=0]").run("damage", () => {
									mc.execute().as("@s[type=#billpack:undead]").run("effect give @s instant_health 1 1 true")
									mc.execute().as("@s[type=!#billpack:undead]").run("effect give @s instant_damage 1 1 true")
									// mc.execute().run(`tellraw @a [{"selector":"@e[tag=gun_shooter,limit=1,sort=nearest]","color":"white","italic":false},{"text":" shot ","color":"white","italic":false},{"selector":"@s","color":"white","italic":false}]`)
								})

								// blocked bullet effects
								mc.execute().if("score #bullet_blocked var matches 1").run("blocked", () => {
									mc.command("particle crit ~ ~ ~ 0.1 0.1 0.1 0.01 2 force")
									mc.command("playsound entity.arrow.shoot master @a ~ ~ ~ 1 2")
								})

								// keep going
								mc.command("scoreboard players add #gun var 1")
								mc.execute().if("score #gun var matches ..300").if("score #gun_succ var matches 0").if("score #bullet_blocked var matches 0").positioned(mc.coords(0, 0, 0.4, mc.enums.COORDS_CARET)).recurse()
							})
							mc.command("tag @s remove gun_shooter")
							mc.command("tp @s ~ ~ ~ ~ ~-" + (musket ? 7 : 1))
							if (musket)
								mc.command('title @s actionbar {"text":"Reloading...","color":"white","italic":false}')
						})
					}
				})

				// reset even if we dont do anything so we cant accidentally trigger by switching to a special one before next tick
				mc.setScore("carrot_stick", 0)
			})

			// musket cooldown
			mc.execute().if("score @s musket_cooldown matches 1..").run("scoreboard players remove @s musket_cooldown 1")

			// musket reload sounds
			mc.execute().as("@s[scores={musket_cooldown=20}]").run("playsound item.crossbow.loading_end master @s ~ ~ ~ 1 0.8")
			mc.execute().as("@s[scores={musket_cooldown=8}]").run("playsound item.crossbow.loading_end master @s ~ ~ ~ 1 1.5")
		},
		["tick-entities-fresh-trader"]: () => {

			// buyable guns
			mc.execute().percent(25).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:13b},sell:{id:"minecraft:carrot_on_a_stick",Count:1b,tag:{CustomModelData:12490003,display:{Name:'{"text":"Flamethrower","color":"gold","italic":false}',Lore:['{"text":"Ammo: Blaze Powder","color":"gray","italic":false}']},special_coas:1b,gun_flame:1b}}}`)
			mc.execute().percent(25).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:15b},sell:{id:"minecraft:carrot_on_a_stick",Count:1b,tag:{CustomModelData:12490001,display:{Name:'{"text":"Musket","color":"gold","italic":false}',Lore:['{"text":"Ammo: Iron Nuggets","color":"gray","italic":false}']},special_coas:1b,gun_musket:1b}}}`)
		}
	},
	{ // baby mod
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
					generateRandomScore("baby_name", data.baby_names[0].length)
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
	},
	{ // harvestcraft
		id: "harvestcraft",
		name: "Nick's HarvestCraft",
		desc: "Adds more food and drinks to vanilla Minecraft.",
		data: {
			brewing_ticks: 80,
			brewing_recipes: [
				["yeast", ["brown_mushroom", "sugar", "brown_mushroom"], ["air", "air", "air"], `{display:{Name:'{"text":"Activated Yeast","color":"#FFE8BA","italic":false}',Lore:['{"text":"The base of alcoholic drinks.","color":"gray","italic":false}']},activated_yeast:1b,CustomPotionEffects:[{Id:23b,Amplifier:2b,Duration:0,ShowParticles:0b}],CustomPotionColor:16771258}`],
				["wine", ["sweet_berries", "(yeast)", "sweet_berries"], ["air", "air", "air"], `{display:{Name:'{"text":"Sweet Berry Wine","color":"#AD0274","italic":false}'},CustomPotionEffects:[{Id:10b,Amplifier:0b,Duration:160,ShowParticles:0b},{Id:23b,Amplifier:3b,Duration:0}],CustomPotionColor:11338356}`],
				["beer", ["wheat", "(yeast)", "wheat"], ["air", "air", "air"], `{display:{Name:'{"text":"Beer","color":"#FFC219","italic":false}'},CustomPotionEffects:[{Id:4b,Amplifier:0b,Duration:600,ShowParticles:0b},{Id:5b,Amplifier:1b,Duration:600,ShowParticles:0b}],CustomPotionColor:16761369}`],
				["wart-wine", ["nether_wart", "(yeast)", "nether_wart"], ["air", "air", "air"], `{display:{Name:'{"text":"Wart Wine","color":"#690F01","italic":false}'},CustomPotionEffects:[{Id:2b,Amplifier:0b,Duration:400,ShowParticles:0b},{Id:9b,Amplifier:0b,Duration:120,ShowParticles:0b},{Id:12b,Amplifier:0b,Duration:600,ShowParticles:0b},{Id:15b,Amplifier:0b,Duration:600,ShowParticles:0b}],CustomPotionColor:6885121}`],
				["coffee", ["redstone", "paper", "redstone"], ["air", "air", "air"], `{display:{Name:'{"text":"Coffee","color":"#785800","italic":false}'},CustomPotionEffects:[{Id:1b,Amplifier:0b,Duration:600,ShowParticles:0b},{Id:3b,Amplifier:1b,Duration:600,ShowParticles:0b},{Id:18b,Amplifier:1b,Duration:600,ShowParticles:0b}],CustomPotionColor:7886848}`],
				["watermelon_juice", ["melon_slice", "sugar", "melon_slice"], ["air", "air", "air"], `{display:{Name:'{"text":"Watermelon Juice","color":"#FF00BB","italic":false}'},CustomPotionEffects:[{Id:23b,Amplifier:3b,Duration:0,ShowParticles:0b}],CustomPotionColor:16711867}`]
			]
		},
/*
		load: () => {
			mc.setScore("#brewing_tick", "var", data.brewing_ticks)
		},
		tick: data => {
			mc.subtractScore("#brewing_tick", "var", 1)
			mc.execute().if("score #brewing_tick var matches ..-1").run(`scoreboard players set #brewing_tick var ${data.brewing_ticks}`)
		},
*/
		["tick-entities"]: data => {
			mc.execute().percent(1).as(`@s[type=item_frame,nbt={Item:{id:"minecraft:potion"}}]`).at("@s").positioned(mc.relativeCoords(0, -0.2, 0)).if("block ~ ~ ~ barrel").run("brew", () => {
				for (let i in data.brewing_recipes)
				{
					let r = data.brewing_recipes[i]

					// alcoholic drinks need yeast as middle ingredient
					let hack = r[1][1] == "(yeast)" ? "tag:{activated_yeast:1b}" : `id:"minecraft:${r[1][1]}"`
					mc.execute().if(`data block ~ ~ ~ Items[{Slot:12b,Count:1b,id:"minecraft:${r[1][0]}"}]`).if(`data block ~ ~ ~ Items[{Slot:13b,Count:1b,${hack}}]`).if(`data block ~ ~ ~ Items[{Slot:14b,Count:1b,id:"minecraft:${r[1][2]}"}]`).run(r[0], () => {
						mc.command(`item replace block ~ ~ ~ container.12 with ${r[2][0]}`)
						mc.command(`item replace block ~ ~ ~ container.13 with ${r[2][1]}`)
						mc.command(`item replace block ~ ~ ~ container.14 with ${r[2][2]}`)
						mc.command(`data modify entity @s Item set value {id:"minecraft:potion",Count:1b,tag:${r[3]}}`)
					})
				}
			})
		},
		["tick-entities-fresh-trader"]: () => {
			mc.command(`data merge entity @s {ArmorItems:[{},{id:"minecraft:rotten_flesh",Count:1b,tag:{display:{Name:'{"text":"Villager Flesh","italic":false}',Lore:['{"text":"May instill a lust for blood...","color":"red","italic":true}']}}},{},{}],ArmorDropChances:[0.085F,1.000F,0.085F,0.085F]}`)
		}
	},
	{ // industry
		id: "industry",
		name: "Industrial Society",
		desc: "Nick's automation pack for vanilla Minecraft.",
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
			mc.addTag(mc.tagType.blocks, "quarry_ignore", ["#billpack:air", "minecraft:water", "minecraft:lava", "#minecraft:dragon_immune"])
			mc.addTag(mc.tagType.blocks, "vein_miner_pickaxe", ["minecraft:coal_ore", "minecraft:copper_ore", "minecraft:iron_ore", "minecraft:gold_ore", "minecraft:lapis_ore", "minecraft:redstone_ore", "minecraft:diamond_ore", "minecraft:emerald_ore", "minecraft:nether_gold_ore", "minecraft:nether_quartz_ore", "minecraft:deepslate_coal_ore", "minecraft:deepslate_copper_ore", "minecraft:deepslate_iron_ore", "minecraft:deepslate_gold_ore", "minecraft:deepslate_lapis_ore", "minecraft:deepslate_redstone_ore", "minecraft:deepslate_diamond_ore", "minecraft:deepslate_emerald_ore"])

			for (let i = 0; i < data.excavatorTypes.length; i++)
			{
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
			mc.setScore("#industrial_tick", "var", 15)
		},
		tick: () => {
			mc.subtractScore("#industrial_tick", "var", 1)
			mc.execute().if("score #industrial_tick var matches ..0").run(`scoreboard players set #industrial_tick var 15`)

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
				for (let i = 0; i < data.excavatorTypes.length; i++)
				{
					let t = data.excavatorTypes[i]
					mc.execute().as(`@s[tag=excavator_${t}]`).run(`excavator-${t}`, () => {

						// excavate a 3x3x3 area
						for (let x = -1; x <= 1; x++)
						{
							for (let y = -1; y <= 1; y++)
							{
								for (let z = -1; z <= 1; z++)
								{
									mc.execute().positioned(mc.relativeCoords(x, y, z)).if(`block ~ ~ ~ #minecraft:mineable/${t}`).run("setblock ~ ~ ~ air destroy")
								}
							}
						}

						// excavate a 3x3 area
					/*
						for (let x = -1; x <= 1; x++)
						{
							for (let y = -1; y <= 1; y++)
							{
								mc.execute().positioned(`^${x} ^${y} ^`).if(`block ~ ~ ~ #minecraft:mineable/${t}`).run("setblock ~ ~ ~ air destroy")
							}
						}
					*/

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
						for (const i of [1, -1])
						{
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
						for (let x = -1; x <= 1; x++)
						{
							for (let y = -1; y <= 1; y++)
							{
								for (let z = -1; z <= 1; z++)
								{
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
									mc.execute().unless("block ~ ~ ~ #billpack:quarry_ignore").run("break", () => {
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
									mc.execute().if("score #quarry_succ var matches 0").unless("score #quarry_x var matches ..4").if("score #quarry_x var matches 4..").positioned(mc.relativeCoords(-4, 0, 1)).run("function billpack:tick-entities-industrial-frame-quarry-r-y")
								})
								mc.addScore("#quarry_depth", "var", 1)
								mc.execute().unless("score #quarry_y var matches ..5").unless("score #quarry_depth var matches 21..").positioned(mc.relativeCoords(0, -1, -5)).run("function billpack:tick-entities-industrial-frame-quarry-r")
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
								for (let x = 0; x <= 5; x++)
								{
									for (let z = 0; z <= 5; z++)
									{
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

							// add 1 to out depth meter
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
								// TODO: tool breaking sound
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
							for (let i = 0; i < data.dyes.length; i++)
							{
								mc.execute().if(`data block ~ ~ ~ Items[{Slot:4b,Count:1b,id:"minecraft:${data.dyes[i]}_dye"}]`).run(i + 1, () => {
									mc.command(`data modify block ~ ~ ~ Items[{Slot:1b}] set value {Slot:1b}`)
									mc.command(`data modify block ~ ~ ~ Items[{Slot:4b}] set value {Slot:4b,Count:1b,id:"minecraft:firework_star",tag:{HideFlags:32,item_receiver:${i + 1}b,display:{Name:'{"text":"Item Receiver (${data.dyeNames[i]})","italic":false}'},Explosion:{Type:0,Colors:[I;${data.dyeColors[i]}]},Enchantments:[{}]}}`)
									mc.setScore("#crafting_succ", "var", 1)
								})
							}
						})

						// craft item transmitter
						mc.execute().if("score #crafting_succ var matches 0").if(`data block ~ ~ ~ Items[{Slot:7b,Count:1b,id:"minecraft:hopper"}]`).run("transmitter", () => {
							for (let i = 0; i < data.dyes.length; i++)
							{
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
						for (let i = 0; i < data.dyes.length; i++)
						{
							let rec = `@e[type=item_frame,sort=nearest,limit=1,distance=..50,nbt={Item:{tag:{item_receiver:${i + 1}b}}}]`
							mc.execute().if(`score #transmit_color var matches ${i + 1}`).if(`entity ${rec}`).as("@e[type=item,distance=..2]").at(rec).run(`tp @s ~ ~0.2 ~`)
						}
					})
				})
			})
		}
	},
	{ // beekeeping
		id: "beekeeping",
		name: "Beekeeping & Apiculture",
		desc: "Rip-off of Forestry bees from FtB, because that mod was soooo much fun. -_-",
		data: {
			// Genetics.Genotype stores alleles
			// Genetics.AlleleSource stores where they came from (0 = mother, 1 = father, 2 = mutation)
			// Genetics.Phenotypes store [Group, Tier]
			bee_egg_nbt: `{id:"minecraft:bee_spawn_egg",Count:1b,tag:{display:{Name:'{"text":"Scooped Bee","color":"gold","italic":false}',Lore:['[{"text":"Genotype: ","color":"gray","italic":false},{"text":"Pending analysis","color":"gray","italic":true}]','[{"text":"Phenotype: ","color":"gray","italic":false},{"text":"Pending analysis","color":"gray","italic":true}]','[{"text":"Byproduct: ","color":"gray","italic":false},{"text":"Pending analysis","color":"gray","italic":true}]']},bee_egg:1b,Genetics:{Genotype:[0,0,0,0],AlleleSources:[0,0,0,0],Phenotypes:[0,0]},Enchantments:[{}],EntityTag:{HandItems:[{id:"minecraft:bee_spawn_egg",Count:1b},{}]}}}`,

			centrifuge_core_tag: `{display:{Name:'{"text":"Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Place in an item frame on top","color":"gray","italic":false}','{"text":"of a smoker to make a centrifuge.","color":"gray","italic":false}']},HideFlags:32,centrifuge_core:1b,Enchantments:[{}],Explosion:{Type:0}}`,

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
				},
				{
					name: "Beta",
					allele: "B",
					color: "#3b71f7",
					products: [
						["sugar", "Sugar", "#e6e6e6", "Sweet", "light_gray_dye"],
						["cocoa_beans", "Cocoa beans", "#a68a02", "Chocolatey", "brown_dye"],
						["bone_meal", "Bone meal", "#e6e6e6", "Fertile", "white_dye"],
						["slime_ball", "Slime", "#8aff78", "Sticky", "lime_dye"]
					]
				},
				{
					name: "Gamma",
					allele: "G",
					color: "#6af73b",
					products: [
						["potato", "Potatoes", "#b89d4f", "Starchy", "brown_dye"],
						["carrot", "Carrots", "#ffaa00", "Crunchy", "orange_dye"],
						["apple", "Apples", "#ff0000", "Tart", "red_dye"],
						["golden_carrot", "Golden carrots", "#ffd900", "Glistening", "yellow_dye"]
					]
				},
				{
					name: "Delta",
					allele: "D",
					color: "#d65cff",
					products: [
						["clay_ball", "Clay", "#59687A", "Malleable", "light_gray_dye"],
						["flint", "Flint", "#5e5e5e", "Sharp", "gray_dye"],
						["charcoal", "Charcoal", "#706b65", "Charred", "black_dye"],
						["gunpowder", "Gunpowder", "#a3a3a3", "Powdery", "gray_dye"]
					]
				},
				{
					name: "Epsilon",
					allele: "E",
					color: "#3bf7e1",
					products: [
						["raw_copper", "Copper", "#a37000", "Oxidized", "green_dye"],
						["raw_iron", "Iron", "#c7c7c7", "Galvanized", "gray_dye"],
						["raw_gold", "Gold", "#ffd000", "Golden", "yellow_dye"],
						["experience_bottle", "C.M.I. Fluid", "#00e5ff", "Pristine", "cyan_dye"]
					]
				},
				{
					name: "Ligma",
					allele: "L",
					color: "#7a0074",
					products: [
						["quartz", "Nether quartz", "#e3d3d4", "Marbled", "white_dye"],
						["blaze_powder", "Blaze powder", "#ffa436", "Smoldering", "orange_dye"],
						["ender_pearl", "Ender pearls", "#2e8740", "Ender", "green_dye"],
						["enchanted_golden_apple", "Enchanted golden apples", "#ee9ffc", "Enchanted", "magenta_dye"]
					]
				},
				{
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
		// /give @p bee_spawn_egg{display:{Name:'{"text":"Beekeeper NPC","color":"yellow","italic":false}'},EntityTag:{id:"minecraft:villager",Silent:1b,CustomNameVisible:1b,PersistenceRequired:1b,CustomName:'{"text":"Beekeeper","color":"yellow","italic":false}',HandItems:[{id:"minecraft:dandelion",Count:1b,tag:{Enchantments:[{}]}},{}],VillagerData:{level:99,profession:"minecraft:nitwit",type:"minecraft:desert"},Offers:{Recipes:[{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:potion",Count:1b,tag:{Potion:"minecraft:water"}},buyB:{id:'minecraft:wheat_seeds',Count:10b},sell:{id:"minecraft:potion",Count:1b,tag:{display:{Name:'{"text":"Seed Oil","color":"white","italic":false}'},HideFlags:32,CustomPotionColor:12104220}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:copper_ingot",Count:1b},buyB:{id:"minecraft:potion",Count:1b,tag:{display:{Name:'{"text":"Seed Oil","color":"white","italic":false}'},HideFlags:32,CustomPotionColor:12104220}},sell:{id:"minecraft:copper_ingot",Count:1b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,Enchantments:[{}]}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:dandelion",Count:4b},buyB:{id:"minecraft:poppy",Count:4b},sell:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},Enchantments:[{}]}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:copper_ingot",Count:4b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,Enchantments:[{}]}},buyB:{id:"minecraft:redstone",Count:2b},sell:{id:"minecraft:clock",Count:1b,tag:{display:{Name:'{"text":"Beealyzer","color":"yellow","italic":false}',Lore:['{"text":"Aim at a bee to see its genetic data.","color":"gray","italic":false}']},beealyzer:1b,Enchantments:[{}]}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:copper_ingot",Count:6b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,Enchantments:[{}]}},buyB:{id:"minecraft:white_wool",Count:2b},sell:{id:"minecraft:iron_shovel",Count:1b,tag:{display:{Name:'{"text":"Bee Scoop","color":"yellow","italic":false}',Lore:['{"text":"Hit bees to scoop them up.","color":"gray","italic":false}','{"text":"Doesn\'t work on baby bees.","color":"gray","italic":false}']},HideFlags:3,bee_scoop:1b,Enchantments:[{id:"minecraft:bane_of_arthropods",lvl:10s}],AttributeModifiers:[{AttributeName:"generic.attack_speed",Name:"generic.attack_speed",Amount:8,Operation:0,UUID:[I;-439119493,1176912908,-1689808493,1467571190],Slot:"mainhand"}]}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:light_gray_dye",Count:1b,tag:{display:{Name:'{"text":"Worn-Out Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Can be repaired with Bee Glue.","color":"gray","italic":false}']},worn_out_centrifuge_core:1b,Enchantments:[{}]}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},Enchantments:[{}]}},sell:{id:"minecraft:firework_star",Count:1b,tag:{display:{Name:'{"text":"Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Place in an item frame on top of","color":"gray","italic":false}','{"text":"a smoker to make a centrifuge.","color":"gray","italic":false}']},centrifuge_core,Explosion:{Type:0}}}}]},Brain:{memories:{"minecraft:job_site":{value:{pos:[I;0,-1,0],dimension:"minecraft:the_end"}}}}}} 1
		init: () => {
			mc.hookAdvancement("harvest-honey-comb", "item_used_on_block", {
				location: {
					block: {
						tag: "minecraft:beehives"
					}
				},
				item: {
					nbt: "{bee_shears:1b}"
				}
			}, () => {
				mc.command("advancement revoke @s only beekeeping:harvest-honey-comb")
				mc.setScore("#max_recursion", "var", 0)
				mc.execute().anchored("eyes").run("loop", () => {
					mc.execute().positioned("^ ^ ^0.02").if("block ~ ~ ~ #minecraft:beehives").run("harvest-hive", () => {

						// check if there are bees in the hive block
						mc.execute().store("success score #bees_in_hive var").run("data get block ~ ~ ~ Bees[0]")

						// check if there are bees flying around
						mc.setScore("#bees_flying_around", "var", 0)
						mc.execute().if("entity @e[type=bee,distance=..20,limit=1]").run("scoreboard players set #bees_flying_around var 1")

						// if we could use either, choose randomly between them
						mc.execute().if("score #bees_in_hive var matches 1").if("score #bees_flying_around var matches 1").run("either", () => {
							mc.setScore("#use_flying_bees", "var", 1)
							mc.execute().percent(50).run("scoreboard players set #use_flying_bees var 0")
						})

						// if we could only use one, make sure we use it
						mc.execute().if("score #bees_in_hive var matches 1").if("score #bees_flying_around var matches 0").run("scoreboard players set #use_flying_bees 0")
						mc.execute().if("score #bees_in_hive var matches 0").if("score #bees_flying_around var matches 1").run("scoreboard players set #use_flying_bees 1")

						// if we could find any bees, do some production
						mc.execute().unless("score #bees_in_hive var matches 0").unless("score #bees_flying_around var matches 0").run("prod", () => {

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
										// TODO: maybe loop thru all the tags
										// group
										for (let j = 0; j < 7; j++)
											mc.execute().as(`@s[tag=bee_group_${i + 1}]`).run(`data modify entity @s HandItems[0].tag.Genetics.Phenotypes[0] set value ${i + 1}`)

										// tiers
										for (let j = 0; j < 4; j++)
											mc.execute().as(`@s[tag=bee_tier_${i + 1}]`).run(`data modify entity @s HandItems[0].tag.Genetics.Phenotypes[1] set value ${i + 1}`)
									})
								}
							})

							// produce from roaming bees
							mc.execute().if("score #use_flying_bees var matches 0").as("@e[type=bee,distance=..21,limit=1,sort=random]").run("roaming", () => {
								mc.execute().store(`result score #bee_prod_group var`).run(`data get entity @s HandItems[0].tag.Genetics.Phenotype[0]`)
								mc.execute().store(`result score #bee_prod_tier var`).run(`data get entity @s HandItems[0].tag.Genetics.Phenotype[1]`)
							})

							// create product depending on phenotype
							for (let i = 0; i < 7; i++)
							{
								for (let j = 0; j < 4; j++)
								{
									mc.execute().if(`score #bee_prod_group var matches ${i + 1}`).if(`score #bee_prod_tier var matches ${j + 1}`).at('@e[limit=1,sort=nearest,nbt={Item:{id:"minecraft:honeycomb"}}]').run(`summon item ~ ~ ~ {Item:{id:"minecraft:${data.bee_groups[i].products[j]}",Count:1b}}`)
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
			mc.setScore("#centrifuge_cooldown", "var", 30)
		},
		tick: () => {
			mc.subtractScore("#beealyzer_cooldown", "var", 1)
			mc.execute().if("score #beealyzer_cooldown var matches ..0").run("scoreboard players set #beealyzer_cooldown var 10")
			mc.subtractScore("#centrifuge_cooldown", "var", 1)
			mc.execute().if("score #centrifuge_cooldown var matches ..0").run("scoreboard players set #centrifuge_cooldown var 30")
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
								generateRandomScore("bee_allele", i < 2 ? 5 : 4)
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
						for (i[0] = 0; i[0] < 7; i[0]++)
						{
							for (i[1] = 0; i[1] < 7; i[1]++)
							{
								for (i[2] = 0; i[2] < 4; i[2]++)
								{
									for (i[3] = 0; i[3] < 4; i[3]++)
									{
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
				mc.execute().if("score #centrifuge_produced var matches 1").percent(0.4).run("break", () => {
					mc.command(`item replace entity @s container.0 with light_gray_dye{display:{Name:'{"text":"Worn-Out Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"It\\'s basically useless now...","color":"gray","italic":false}']}}`)
					mc.command("playsound block.lava.extinguish master @a ~ ~ ~")
				})
			})
		},
		// /give @p bee_spawn_egg{display:{Name:'{"text":"Beekeeper NPC","color":"yellow","italic":false}'},EntityTag:{id:"minecraft:villager",Silent:1b,CustomNameVisible:1b,PersistenceRequired:1b,CustomName:'{"text":"Beekeeper","color":"yellow","italic":false}',HandItems:[{id:"minecraft:dandelion",Count:1b,tag:{Enchantments:[{}]}},{}],VillagerData:{level:99,profession:"minecraft:nitwit",type:"minecraft:desert"},Offers:{Recipes:[{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:potion",Count:1b,tag:{Potion:"minecraft:water"}},buyB:{id:"minecraft:wheat_seeds",Count:8b},sell:{id:"minecraft:potion",Count:1b,tag:{display:{Name:'{"text":"Seed Oil","color":"white","italic":false}'},HideFlags:32,CustomPotionColor:12104220}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:copper_ingot",Count:1b},buyB:{id:"minecraft:potion",Count:1b,tag:{display:{Name:'{"text":"Seed Oil","color":"white","italic":false}'},HideFlags:32,CustomPotionColor:12104220}},sell:{id:"minecraft:copper_ingot",Count:1b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,Enchantments:[{}]}}},{rewardExp:0b,maxUses:99999,buy:{id:"minecraft:dandelion",Count:4b},buyB:{id:"minecraft:poppy",Count:4b},sell:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},Enchantments:[{}]}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:copper_ingot",Count:4b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,Enchantments:[{}]}},buyB:{id:"minecraft:redstone",Count:1b},sell:{id:"minecraft:clock",Count:1b,tag:{display:{Name:'{"text":"Beealyzer","color":"yellow","italic":false}',Lore:['{"text":"Aim at a bee to see its genetic data.","color":"gray","italic":false}']},beealyzer:1b,Enchantments:[{}]}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:stick",Count:2b},buyB:{id:"minecraft:white_wool",Count:1b},sell:{id:"minecraft:iron_shovel",Count:1b,tag:{display:{Name:'{"text":"Bee Scoop","color":"yellow","italic":false}',Lore:['{"text":"Hit bees to scoop them up.","color":"gray","italic":false}','{"text":"Doesn\'t work on baby bees.","color":"gray","italic":false}']},HideFlags:3,bee_scoop:1b,Enchantments:[{id:"minecraft:bane_of_arthropods",lvl:10s}],AttributeModifiers:[{AttributeName:"generic.attack_speed",Name:"generic.attack_speed",Amount:8,Operation:0,UUID:[I;-358646086,-2090973918,-1928468940,1275977905],Slot:"mainhand"}]}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:light_gray_dye",Count:1b,tag:{display:{Name:'{"text":"Worn-Out Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Can be repaired with Bee Glue.","color":"gray","italic":false}']},worn_out_centrifuge_core:1b,Enchantments:[{}]}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},Enchantments:[{}]}},sell:{id:"minecraft:firework_star",Count:1b,tag:{display:{Name:'{"text":"Centrifuge Core","color":"#B5934E","italic":false}',Lore:['{"text":"Place in an item frame on top of","color":"gray","italic":false}','{"text":"a smoker to make a centrifuge.","color":"gray","italic":false}']},HideFlags:32,centrifuge_core:1b,Enchantments:[{}],Explosion:{Type:0}}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:copper_ingot",Count:3b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,Enchantments:[{}]}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},Enchantments:[{}]}},sell:{id:"minecraft:leather_helmet",Count:1b,tag:{display:{Name:'{"text":"Bee Suit Helmet","color":"yellow","italic":false}',Lore:['{"text":"Full set keeps bees from getting angry.","color":"gray","italic":false}'],color:3157248},HideFlags:66,bee_suit:1b}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:copper_ingot",Count:5b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,Enchantments:[{}]}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},Enchantments:[{}]}},sell:{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{Name:'{"text":"Bee Suit Top","color":"yellow","italic":false}',Lore:['{"text":"Full set keeps bees from getting angry.","color":"gray","italic":false}'],color:16771415},HideFlags:66,bee_suit:1b}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:copper_ingot",Count:4b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,Enchantments:[{}]}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},Enchantments:[{}]}},sell:{id:"minecraft:leather_leggings",Count:1b,tag:{display:{Name:'{"text":"Bee Suit Pants","color":"yellow","italic":false}',Lore:['{"text":"Full set keeps bees from getting angry.","color":"gray","italic":false}'],color:16771415},HideFlags:66,bee_suit:1b}}},{rewardExp:0b,maxUses:9999,buy:{id:"minecraft:copper_ingot",Count:2b,tag:{display:{Name:'{"text":"Impregnated Ingot","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},bee_ingot:1b,Enchantments:[{}]}},buyB:{id:"minecraft:orange_dye",Count:1b,tag:{display:{Name:'{"text":"Bee Glue","color":"yellow","italic":false}',Lore:['{"text":"Used to craft various bee-related items.","color":"gray","italic":false}']},Enchantments:[{}]}},sell:{id:"minecraft:leather_boots",Count:1b,tag:{display:{Name:'{"text":"Bee Suit Boots","color":"yellow","italic":false}',Lore:['{"text":"Full set keeps bees from getting angry.","color":"gray","italic":false}'],color:3157248},HideFlags:66,bee_suit:1b}}}]},Brain:{memories:{"minecraft:job_site":{value:{pos:[I;0,-1,0],dimension:"minecraft:the_end"}}}}}} 1
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
					mc.execute().unless("block ^ ^ ^0.2 #billpack:air").run("scoreboard players set #beealyzer_fail var 1")

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
					mc.command(`tellraw @s "=== Bee Analyzed ==="`)
					mc.command(`tellraw @s {"text":"First two alleles determine group.","color":"gray"}`)
					mc.command(`tellraw @s {"text":"Second two alleles determine tier.","color":"gray"}`)

					// store target selector, we use this a lot
					const target = "@e[type=bee,limit=1,tag=bee_analyze]"

					// put the bee's data into the scoreboard
					for (let i = 0; i < 4; i++)
					{
						mc.execute().store(`result score #beealyzer_allele_${i} var`).run(`data get entity ${target} HandItems[0].tag.Genetics.Genotype[${i}]`)
						mc.execute().store(`result score #beealyzer_allele_source_${i} var`).run(`data get entity ${target} HandItems[0].tag.Genetics.AlleleSources[${i}]`)
						if (i < 2)
							mc.execute().store(`result score #beealyzer_phenotype_${i} var`).run(`data get entity ${target} HandItems[0].tag.Genetics.Phenotypes[${i}]`)
					}

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
					for (let i = 0; i < 7; i++)
					{
						// 4 tiers
						for (let j = 0; j < 4; j++)
						{
							mc.execute().if(`score #beealyzer_phenotype_0 var matches ${i + 1}`).if(`score #beealyzer_phenotype_1 var matches ${j + 1}`).run(`${i}-${j}`, () => {
								mc.command(`tellraw @s [{"text":"Phenotype: ","color":"gray"},{"text":"${data.bee_groups[i].name}-${j + 1}","color":"${data.bee_groups[i].color}","hoverEvent":{"action":"show_text","contents":[{"text":"Group ","color":"gray"},{"text":"${data.bee_groups[i].name}","color":"${data.bee_groups[i].color}"},{"text":", tier ${j + 1}","color":"gray"}]}}]`)
								mc.command(`tellraw @s [{"text":"Byproduct: ","color":"gray"},{"text":"${data.bee_groups[i].products[j][1]}","color":"${data.bee_groups[i].products[j][2]}","hoverEvent":{"action":"show_text","contents":{"text":"This bee will place this by-product into nearby empty item frames. ","color":"gray"}}}]`)
							})
						}
					}

					// write genetic data to description of bee's dropped egg
					mc.execute().as("@e[type=bee,limit=1,tag=bee_analyze,tag=!bee_analyzed]").run("egg", () => {
						let i = []
						for (i[0] = 0; i[0] < 7; i[0]++)
						{
							for (i[1] = 0; i[1] < 7; i[1]++)
							{
								for (i[2] = 0; i[2] < 4; i[2]++)
								{
									for (i[3] = 0; i[3] < 4; i[3]++)
									{
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

			// beealyzer
			mc.execute().percent(60).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:dandelion",Count:10b},buyB:{id:"minecraft:poppy",Count:10b},sell:{id:"minecraft:clock",Count:1b,tag:{display:{Name:'{"text":"Beealyzer","color":"gold","italic":false}',Lore:['{"text":"Point this at a bee to see its genetic data.","color":"gray","italic":false}']},beealyzer:1b}}}`)

			// scoop
			mc.execute().percent(60).run(`data modify entity @s Offers.Recipes append value {buy:{id:"minecraft:emerald",Count:8b},sell:{id:"minecraft:iron_shovel",Count:1b,tag:{display:{Name:'{"text":"Bee Scoop","color":"gold","italic":false}',Lore:['{"text":"Can be used to scoop bees up into your inventory.","color":"gray","italic":false}']},HideFlags:1,bee_scoop:1b,Enchantments:[{id:"minecraft:bane_of_arthropods",lvl:10s}]}}}`)
		}
	},
	{ // mine co supply eggs
		id: "supply-eggs",
		name: "Mine Co. Supply Eggs",
		desc: "Turns Minecraft into a gacha game.",
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
					[10, "Unremarkable"],
					[25, "Scarcely Lethal"],
					[45, "Mildly Menacing"],
					[70, "Somewhat Threatening"],
					[100, "Uncharitable"],
					[135, "Notably Dangerous"],
					[175, "Sufficiently Lethal"],
					[225, "Truly Feared"],
					[275, "Spectacularly Lethal"],
					[350, "Gore-Spattered"],
					[500, "Wicked Nasty"],
					[750, "Positively Inhumane"],
					[999, "Totally Ordinary"],
					[1000, "Face-Melting"],
					[1500, "Rage-Inducing"],
					[2500, "Server-Clearing"],
					[5000, "Epic"],
					[7500, "Legendary"],
					[7616, "Minecraftian"],
					[8500, "Herobrine\\'s Own"],
				],
				[
					[0, "Strange"],
					[10, "Unremarkable"],
					[25, "Scarcely Lethal"],
					[45, "Mildly Menacing"],
					[70, "Somewhat Threatening"],
					[100, "Uncharitable"],
					[135, "Notably Dangerous"],
					[175, "Sufficiently Lethal"],
					[225, "Truly Feared"],
					[275, "Spectacularly Lethal"],
					[350, "Gore-Spattered"],
					[500, "Wicked Nasty"],
					[750, "Positively Inhumane"],
					[999, "Totally Ordinary"],
					[1000, "Face-Melting"],
					[1300, "Rage-Inducing"],
					[1750, "Server-Clearing"],
					[2250, "Epic"],
					[3000, "Legendary"],
					[4000, "Minecraftian"],
					[5000, "Herobrine\\'s Own"],
				],
				[
					[0, "Strange"],
					[10, "Unremarkable"],
					[25, "Scarcely Lethal"],
					[45, "Mildly Menacing"],
					[70, "Somewhat Threatening"],
					[100, "Uncharitable"],
					[135, "Notably Dangerous"],
					[175, "Sufficiently Lethal"],
					[225, "Truly Feared"],
					[275, "Spectacularly Lethal"],
					[350, "Gore-Spattered"],
					[500, "Wicked Nasty"],
					[750, "Positively Inhumane"],
					[999, "Totally Ordinary"],
					[1000, "Face-Melting"],
					[1300, "Rage-Inducing"],
					[1750, "Server-Clearing"],
					[2250, "Epic"],
					[3000, "Legendary"],
					[4000, "Minecraftian"],
					[5000, "Herobrine\\'s Own"],
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
							generateRandomScore("unusual_fx", data.unusual_effects[i][3].length, data.unusual_effects[i][3])
						})
					}
				}
			})

			// got kill
			mc.execute().if("score @s strange_kills matches 1..").run("kill", () => {

				// holding strange weapon
				mc.execute().if("data entity @s SelectedItem.tag.strange_weapon").run("strange", () => {

					for (let w in data.strange_weapons)
					{
						mc.execute().if(`data entity @s SelectedItem.tag.strange_${data.strange_weapons[w][0]}`).run(data.strange_weapons[w][0], () => {

							// remember what the block even was
							mc.setScore("#was_air", "var", 1)
							mc.execute().if("block ~ 0 ~ bedrock").run("scoreboard players set #was_air var 0")

							// add 1 to the kills
							mc.execute().store("result score #strange_kills var").run("data get entity @s SelectedItem.tag.strange_kills")
							mc.addScore("#strange_kills", "var", 1)

							// shulker box fuckery
							mc.command("setblock ~ 0 ~ yellow_shulker_box")
							mc.command(`data modify block ~ 0 ~ Items append from entity @s SelectedItem`)
							mc.execute().store("result block ~ 0 ~ Items[0].tag.strange_kills int 1.0").run("scoreboard players get #strange_kills var")

							// format kills for name & description
							let highestLevel = data.strange_prefixes[w][data.strange_prefixes[w].length - 1]
							for (let i = 1; i <= highestLevel[0]; i++)
							{
								let kills = i.toLocaleString()
								let range = i
								let prefix = "Strange"
								if (i == highestLevel[0])
								{
									range = i + ".."
									kills = kills + "+"
									prefix = highestLevel[1]
								}
								else
								{
									for (let j = 0; j < data.strange_prefixes[w].length; j++)
									{
										if (i < data.strange_prefixes[w][j][0])
										{
											prefix = data.strange_prefixes[w][j - 1][1]
											if (i == data.strange_prefixes[w][j - 1][0])
												mc.execute().if(`score #strange_kills var matches ${i}`).run(`tellraw @a [{"selector":"@s","color":"white"},{"text":"'s ${data.strange_weapons[w][0]} has just reached a new rank: "},{"text":"${prefix}","color":"${data.color_strange}"},{"text":"!","color":"white"}]`)
											break
										}
									}
								}

								mc.execute().if(`score #strange_kills var matches ${i}`).run(`data modify block ~ 0 ~ Items[0].tag.display set value {Name:'{"text":"${prefix} ${data.strange_weapons[w][1]}","color":"${data.color_strange}","italic":false}',Lore:['{"text":"Kills: ${kills}","color":"gray","italic":false}']}`)
							}

							mc.command("item replace entity @s weapon.mainhand from block ~ 0 ~ container.0")

							// replace the block
							mc.execute().if("score #was_air var matches 0").run("setblock ~ 0 ~ bedrock")
							mc.execute().if("score #was_air var matches 1").run("setblock ~ 0 ~ air")
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
					generateRandomScore("supply_egg_loot", strange_wep_cmds.length, strange_wep_cmds)
				})

				// unusual output
				mc.execute().if("score #got_unusual var matches 1").run("unusual", () => {
					generateRandomScore("supply_egg_loot", unusual_hat_cmds.length, unusual_hat_cmds)
					mc.command("playsound entity.firework_rocket.large_blast master @a ~ ~ ~ 1 1")
					mc.command("playsound entity.firework_rocket.twinkle master @a ~ ~ ~ 1 1")
				})

				// get rid of the marker
				mc.command("kill @s")
			})
		},
		["tick-entities-fresh-trader"]: data => {

			//  give all traders supply eggs
			mc.command(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:gold_ingot",Count:12b},sell:{id:"minecraft:villager_spawn_egg",Count:1b, tag:${data.supply_egg_nbt}}}`)
		}
	}
]

/*     vvv     compiler init     vvv     */

if (true)
{
	// mark expensive multi-entity executes
	mc.addMarker("as @a")
	mc.addMarker("at @a")
	mc.addMarker("as @e")

	// world path
	mc.root(DATAPACK_DIR)

	// give us some logs
	mc.compilerMode(MODE_DEBUG)
}

/*     ^^^     compiler init     ^^^     */

for (let i in ModList)
{
	let mod = ModList[i]
	mc.startPack(mod.id, mod.desc, DATAPACK_FORMAT)
	mc.namespace(mod.id)
	if (mod.init) mod.init(mod.data)
	for (let hook in mod)
	{
		if (hook == "init" || typeof mod[hook] != "function")
			continue

		mc.createFunction(hook, () => {
			mod[hook](mod.data)
		})
		mc.hook(hook, hook, (hook == "load" || hook == "tick") ? "minecraft" : "billpack")
	}
	if (!mod.hideInList)
	{
		mc.createFunction("mod-list", () => {
			let hoverEvent = `,"hoverEvent":{"action":"show_text","contents":[{"text":"${mod.desc}"}]}}`
			mc.command(`tellraw @s [{"text":" - ${mod.name}","color":"gray"${hoverEvent}]`)
		})
		mc.hook("mod-list", "mod-list", "billpack")
	}

	// add the base code to every mod
	if (true) {
		mc.namespace("billpack")

		// tags
		mc.addTag(mc.tagType.blocks, "dirt_or_grass", ["minecraft:dirt", "minecraft:grass_block"])
		mc.addTag(mc.tagType.blocks, "air", ["minecraft:air", "minecraft:cave_air"])
		mc.addTag(mc.tagType.blocks, "stone_variants", ["minecraft:stone", "minecraft:andesite", "minecraft:diorite", "minecraft:granite"])
		mc.addTag(mc.tagType.entities, "undead", ["#minecraft:skeletons", "minecraft:zombie", "minecraft:husk", "minecraft:zombie_villager", "minecraft:wither", "minecraft:wither_skeleton", "minecraft:zombie_horse", "minecraft:skeleton_horse", "minecraft:phantom"])

		// predicates
		mc.addPredicate("raining", "weather_check", ["raining"], [true])

		// admin shop
		mc.createFunction("admin-shop", () => {
			mc.command('summon wandering_trader ~ ~ ~ {Silent:1b,Glowing:1b,CustomNameVisible:1b,PersistenceRequired:1b,CanPickUpLoot:0b,Tags:["admin_shop"],CustomName:\'{"text":"ADMIN SHOP","color":"red","bold":true,"italic":false}\',Offers:{Recipes:[{rewardExp:0b,buy:{id:"minecraft:command_block",Count:1b},sell:{id:"minecraft:splash_potion",Count:1b,tag:{display:{Name:\'{"text":"Rocket Potion","color":"green","bold":true,"italic":false}\'},CustomPotionEffects:[{Id:25b,Amplifier:127b,Duration:40,ShowParticles:0b}],CustomPotionColor:4194063}}},{rewardExp:0b,buy:{id:"minecraft:command_block",Count:1b},sell:{id:"minecraft:stick",Count:1b,tag:{display:{Name:\'{"text":"Sumo Stick","color":"gray","bold":true,"italic":false}\'},Enchantments:[{id:"minecraft:knockback",lvl:10s}]}}},{buy:{id:"minecraft:command_block",Count:1b},sell:{id:"minecraft:clock",Count:1b,tag:{display:{Name:\'{"text":"Armor Deleter","color":"yellow","bold":true,"italic":false}\'},Enchantments:[{id:"minecraft:sharpness",lvl:32767s}]}}},{buy:{id:"minecraft:command_block",Count:1b},sell:{id:"minecraft:diamond_chestplate",Count:1b,tag:{display:{Name:\'{"text":"Godmode","color":"aqua","bold":true,"italic":false}\'},Unbreakable:1b,Enchantments:[{id:"minecraft:protection",lvl:32767s}]}}},{buy:{id:"minecraft:command_block",Count:1b},sell:{id:"minecraft:leather_boots",Count:1b,tag:{display:{Name:\'{"text":"Speedy Shoes","color":"gold","bold":true,"italic":false}\',color:16753413},Unbreakable:1b,AttributeModifiers:[{AttributeName:"generic.movementSpeed",Name:"generic.movementSpeed",Amount:2,Operation:2,UUIDLeast:-3337447,UUIDMost:2070965,Slot:"feet"}]}}},{buy:{id:"minecraft:command_block",Count:1b},sell:{id:"minecraft:fox_spawn_egg",Count:1b,tag:{display:{Name:\'{"text":"Furry Spawn Egg","color":"white","italic":false}\',Lore:[\'{"text":"!!! WARNING: DANGEROUS !!!","color":"dark_red","bold":true,"italic":false}\']},EntityTag:{id:"minecraft:zombie",Silent:1b,CustomNameVisible:1b,PersistenceRequired:1b,CanPickUpLoot:0b,Health:1000f,IsBaby:0b,CanBreakDoors:1b,Tags:["boss_furry"],CustomName:\'{"text":"Furry","bold":true,"italic":false}\',ArmorItems:[{id:"minecraft:leather_boots",Count:1b,tag:{display:{Name:\'{"text":"Fursuit Paws","color":"white","italic":false}\',color:16775119},Unbreakable:1b}},{id:"minecraft:leather_leggings",Count:1b,tag:{display:{Name:\'{"text":"Fursuit Pants","color":"gold","italic":false}\',color:13604389},Unbreakable:1b}},{id:"minecraft:leather_chestplate",Count:1b,tag:{display:{Name:\'{"text":"Fursuit Shirt","color":"gold","italic":false}\',color:13209868},Unbreakable:1b}},{id:"minecraft:player_head",Count:1b,tag:{SkullOwner:{Id:"1dc47af4-b4c2-4780-a932-5d3e6bd6a406",Properties:{textures:[{Value:"eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMjRhMDM0NzQzNjQzNGViMTNkNTM3YjllYjZiNDViNmVmNGM1YTc4Zjg2ZTkxODYzZWY2MWQyYjhhNTNiODIifX19"}]}}}}],ArmorDropChances:[2.000F,2.000F,2.000F,0.085F],Attributes:[{Name:generic.maxHealth,Base:1000},{Name:generic.followRange,Base:400},{Name:generic.movementSpeed,Base:1},{Name:generic.attackDamage,Base:12}]}}}}]}}')
		})

		mc.createFunction("load", () => {

			// create necessary objectives
			mc.addObjective("var", "dummy")
			mc.addObjective("just_joined", "minecraft.custom:minecraft.leave_game", false, false)

			// announce mod reloading
			mc.command(`tellraw @a {"text":"Reloading mods...","color":"gray","italic":true}`)
		})
		mc.hook("load", "load")

		mc.createFunction("tick", () => {

			// player tick
			mc.execute().as("@a").at("@s").run("players", () => {

				// hook the mod list
				mc.command("function #billpack:tick-players")

				// player joined
				mc.execute().as("@s[scores={just_joined=1..}]").run("welcome", () => {

					// hook the mod list
					mc.command("function #billpack:welcome")

					// been here before
					mc.execute().as("@s[tag=joined_before]").run("returning", () => {
						mc.command("function #billpack:welcome-returning")
					})

					// brand new player
					mc.execute().as("@s[tag=!joined_before]").run("new", () => {
						mc.command("tag @s add joined_before")
						mc.command("function #billpack:welcome-new")
					})

					// show mod list
					mc.command('tellraw @s ""')
					mc.command('tellraw @s {"text":"Active mods: (Hover for details)","underlined":true,"color":"gray"}')
					mc.command("function #billpack:mod-list")

					// mark them as here on the attendance sheet
					// good job coming to class on time!
					mc.setScore("just_joined", 0)
				})
			})

			// entity tick
			mc.execute().as("@e[type=!player]").at("@s").run("entities", () => {

				// hook the mod list
				mc.command("function #billpack:tick-entities")

				// entities that just spawned
				mc.execute().as("@s[tag=!been_spawned]").run("fresh", () => {

					// hook the mod list
					mc.command("function #billpack:tick-entities-fresh")

					// items that were just dropped
					mc.execute().as("@s[type=item]").run("function #billpack:tick-entities-fresh-item")

					// traders that just spawned
					mc.execute().as("@s[type=wandering_trader]").run("function #billpack:tick-entities-fresh-trader")

					// no longer freshly spawned
					mc.command("tag @s add been_spawned")
				})
			})
		})
		mc.hook("tick", "tick")
	}
}

mc.markReport()
mc.lineCount()
