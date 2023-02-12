const mc = require("./../mcdpi")

module.exports = {
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
						mc.execute().unless("block ^ ^ ^0.3 #oyumod:air").run("scoreboard players set #gun_succ var 1")
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
						mc.execute().unless("block ^ ^ ^0.3 #oyumod:air").run("scoreboard players set #gun_succ var 1")
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
							mc.execute().unless("block ^ ^ ^0.4 #oyumod:air").unless("block ^ ^ ^0.4 water").run("scoreboard players set #bullet_blocked var 1")

							// break plants
							mc.execute().if("score #bullet_blocked var matches 1").if("block ^ ^ ^0.4 #guns:gun_breakable").run("break", () => {
								mc.command("setblock ^ ^ ^0.4 air destroy")
								mc.setScore("#bullet_blocked", "var", 0)
							})

							// tracer particle
							// mc.execute().unless("block ~ ~ ~ water").run("particle crit ~ ~ ~ 0.1 0.1 0.1 0.01 1 force")
							mc.execute().if("block ~ ~ ~ water").run("particle bubble ~ ~ ~ 0.1 0.1 0.1 0.01 1 force")

							// hit target check
							mc.execute().if("entity @e[limit=1,sort=nearest,tag=!gun_shooter,type=!item,dx=0.1,dy=0.1,dz=0.1]").run("scoreboard players set #gun_succ var 1")
							mc.execute().if("score #gun_succ var matches 1").as("@e[tag=!gun_shooter,type=!item,dx=0.1,dy=0.1,dz=0.1]").run("damage", () => {
								mc.command("say ouch!")
								mc.execute().as("@s[type=#oyumod:undead]").run("effect give @s instant_health 1 1 true")
								mc.execute().as("@s[type=!#oyumod:undead]").run("effect give @s instant_damage 1 1 true")
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
}
