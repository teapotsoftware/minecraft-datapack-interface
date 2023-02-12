const mc = require("./../mcdpi")

module.exports = {
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
}