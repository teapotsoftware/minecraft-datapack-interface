const mc = require("./../mcdpi")

module.exports = {
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
		// drop meat >:3
		mc.command(`data merge entity @s {ArmorItems:[{},{id:"minecraft:rotten_flesh",Count:1b,tag:{display:{Name:'{"text":"Villager Flesh","italic":false}',Lore:['{"text":"May instill a lust for blood...","color":"red","italic":true}']}}},{},{}],ArmorDropChances:[0.085F,1.000F,0.085F,0.085F]}`)

		// cheap soups
		mc.execute().percent(33).run(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:emerald",Count:1b},sell:{id:"minecraft:mushroom_stew",Count:1b,tag:{display:{Name:'{"text":"Chocolate Ice Cream","italic":false}'}}}}`)
		mc.execute().percent(33).run(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:emerald",Count:1b},sell:{id:"minecraft:beetroot_soup",Count:1b,tag:{display:{Name:'{"text":"Tomato Soup","italic":false}'}}}}`)
		mc.execute().percent(33).run(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:emerald",Count:1b},sell:{id:"minecraft:rabbit_stew",Count:1b,tag:{display:{Name:'{"text":"Pad Thai","italic":false}'}}}}`)
		mc.execute().percent(33).run(`data modify entity @s Offers.Recipes prepend value {buy:{id:"minecraft:emerald",Count:1b},sell:{id:"minecraft:pumpkin_pie",Count:1b,tag:{display:{Name:'{"text":"Cheesecake","italic":false}'}}}}`)
	}
}
