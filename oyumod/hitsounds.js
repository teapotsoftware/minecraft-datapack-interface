const mc = require("./../mcdpi")

module.exports = {
	id: "hitsounds",
	name: "Hit Sounds",
	desc: "Play a sound when you do damage. Type \\\"/trigger hitsound\\\" to change.",
	updated: [2, 12, 23],
	data: {
		item_hitsounds: [
			["bone", "block.bone_block.place", 1.1],
			["stick", "block.wood.break", 2],
			[["porkchop", "beef", "mutton", "chicken", "rabbit"], "entity.slime.squish_small", 0.9],
			[["cod", "salmon", "tropical_fish", "pufferfish", "slime_ball"], "entity.slime.squish_small", 1.1],
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
			// item hitsounds (bone goes *bonk*)
			for (let i = 0; i < data.item_hitsounds.length; i++) {
				if (typeof data.item_hitsounds[i][0] == "string") {
					mc.execute().as(`@s[nbt={SelectedItem:{id:"minecraft:${data.item_hitsounds[i][0]}"}}]`).run(`playsound ${data.item_hitsounds[i][1]} master @a ~ ~ ~ 1 ${data.item_hitsounds[i][2]}`)
				} else {
					for (let j = 0; j < data.item_hitsounds[i][0].length; j++) {
						mc.execute().as(`@s[nbt={SelectedItem:{id:"minecraft:${data.item_hitsounds[i][0][j]}"}}]`).run(`playsound ${data.item_hitsounds[i][1]} master @a ~ ~ ~ 1 ${data.item_hitsounds[i][2]}`)
					}
				}
			}

			// make sure its in range
			mc.execute().as("@s[scores={hitsound=8..}]").run("over7", () => {
				mc.setScore("#temp", "var", 8)
				mc.command("scoreboard players operation @s hitsound %= #temp var")
			})
			for (let i = 0; i < data.custom_hitsounds.length; i++)
				mc.execute().as("@s[scores={hitsound=" + (i + 1) + "}]").run("playsound " + data.custom_hitsounds[i][0] + " master @s ~ ~ ~ 1 " + data.custom_hitsounds[i][1])

			// return to normal
			mc.command("advancement revoke @s only hitsounds:hitsound")
		})
	},
	load: () => {
		// objectives
		mc.addObjective("hitsound", "trigger")
	},
	["tick-players"]: () => {
		// re-enable hitsound change trigger
		mc.command("scoreboard players enable @s hitsound")
	}
}