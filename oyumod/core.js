const mc = require("./../mcdpi")
const fs = require("fs")

const WORLD_DIRS = ["C:/Users/sirfr/AppData/Roaming/.minecraft/saves/billpack-testing",
	"C:/Users/Nick/AppData/Roaming/.minecraft/saves/oyumod-testing",
	"C:/Users/Nick/Desktop/1.19.2 Server/world"
]
const DATAPACK_FORMAT = 10

const ModList = [
	require("./baby"),
	require("./bee"),
	require("./chance"),
	require("./copper"),
	require("./counter"),
	require("./dj"),
	require("./food"),
	require("./guns"),
	require("./hitsounds"),
	require("./industry"),
	require("./instruments"),
	require("./joinmsg"),
	require("./milestones"),
	require("./names"),
	require("./onepearl"),
	require("./tf2"),
	require("./zombies")
]

// find datapack directory
var DATAPACK_DIR
for (let i in WORLD_DIRS) {
	let dir = WORLD_DIRS[i] + "/datapacks"
	if (fs.existsSync(dir)) {
		fs.rmSync(dir, {recursive: true, force: true})
		fs.mkdirSync(dir, {recursive: true})
		DATAPACK_DIR = dir
		mc.echo(`Found directory: ${dir}`)
		break
	}
}

/*
// mark expensive multi-entity executes
mc.addMarker("as @a")
mc.addMarker("at @a")
mc.addMarker("as @e")
*/

// world path
mc.root(DATAPACK_DIR)

// give us some logs
mc.compilerMode(MODE_DEBUG)

for (let i in ModList) {
	let mod = ModList[i]
	mc.startPack(mod.id, mod.desc, DATAPACK_FORMAT)
	mc.namespace(mod.id)
	if (mod.init) mod.init(mod.data)
	for (let hook in mod) {
		if (hook == "init" || typeof mod[hook] != "function")
			continue

		mc.createFunction(hook, () => {
			mod[hook](mod.data)
		})
		mc.hook(hook, hook, (hook == "load" || hook == "tick") ? "minecraft" : "oyumod")
	}
	if (!mod.hideInList) {
		mc.createFunction("mod-list", () => {
			let hoverEvent = `,"hoverEvent":{"action":"show_text","contents":[{"text":"${mod.desc} ","color":"white"},{"text":"(Updated ${mod.updated[0]}/${mod.updated[1]}/20${mod.updated[2]})","color":"gray"}]}}`
			mc.command(`tellraw @s [{"text":" - ${mod.name}","color":"gray"${hoverEvent}]`)
		})
		mc.hook("mod-list", "mod-list", "oyumod")
	}

	// add the base code to every mod
	mc.namespace("oyumod")

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
			mc.command("function #oyumod:tick-players")

			// player joined
			mc.execute().as("@s[scores={just_joined=1..}]").run("welcome", () => {

				// hook the mod list
				mc.command("function #oyumod:welcome")

				// been here before
				mc.execute().as("@s[tag=joined_before]").run("returning", () => {
					mc.command("function #oyumod:welcome-returning")
				})

				// brand new player
				mc.execute().as("@s[tag=!joined_before]").run("new", () => {
					mc.command("tag @s add joined_before")
					mc.command("function #oyumod:welcome-new")
				})

				// show mod list
				mc.command('tellraw @s ""')
				mc.command('tellraw @s {"text":"Active mods: (Hover for details)","underlined":true,"color":"gray"}')
				mc.command("function #oyumod:mod-list")

				// mark them as here on the attendance sheet
				// good job coming to class on time!
				mc.setScore("just_joined", 0)
			})
		})

		// entity tick
		mc.execute().as("@e[type=!player]").at("@s").run("entities", () => {

			// hook the mod list
			mc.command("function #oyumod:tick-entities")

			// entities that just spawned
			mc.execute().as("@s[tag=!been_spawned]").run("fresh", () => {

				// hook the mod list
				mc.command("function #oyumod:tick-entities-fresh")

				// items that were just dropped
				mc.execute().as("@s[type=item]").run("function #oyumod:tick-entities-fresh-item")

				// traders that just spawned
				mc.execute().as("@s[type=wandering_trader]").run("function #oyumod:tick-entities-fresh-trader")

				// no longer freshly spawned
				mc.command("tag @s add been_spawned")
			})
		})
	})
	mc.hook("tick", "tick")
}

// mc.markReport()
mc.lineCount()
