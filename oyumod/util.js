const mc = require("./../mcdpi")

module.exports = {
	// generates a random int in [0, max)
	// not really sure if its evenly distributed but i dont care
	generateRandomScore: function(name, max, f = null, id = "") {
		mc.command(`scoreboard players set #${name} var 0`)
		for (let i = 0, n = Math.ceil(Math.log2(max)) + 2; i < n; i++)
			mc.execute().percent(50).run(`scoreboard players add #${name} var ${Math.pow(2, i)}`)
		mc.command(`scoreboard players set #${name}_max var ${max}`)
		mc.command(`scoreboard players operation #${name} var %= #${name}_max var`)

		// optional parameter to actually do something with the generated random
		if (f != null) {
			for (let i = 0; i < max; i++) {
				if (typeof f == "function") {
					// function thats called for every value in the range
					mc.execute().if(`score #${name} var matches ${i}`).run(id + (i + 1), () => {
						f(i)
					})
				} else {
					// otherwise assume an array of the different random outcomes
					if (typeof f[i] == "string") {
						mc.execute().if(`score #${name} var matches ${i}`).run(f[i])
					} else if (typeof f[i] == "function") {
						mc.execute().if(`score #${name} var matches ${i}`).run(id + (i + 1), () => {
							f[i]()
						})
					} else {
						// assume an array of strings
						mc.execute().if(`score #${name} var matches ${i}`).run(id + (i + 1), () => {
							for (let j = 0, n = f[i].length; j < n; j++)
								mc.command(f[i][j])
						})
					}
				}
			}
		}
	},
	debugMsg: function(txt) {mc.command(`tellraw @a {"text":"[debug] ${txt}","color":"dark_aqua"}`)},
	chance_cube_nbt: `{Enchantments:[{id:-1}],display:{Name:'{"text":"Chance Cube","color":"#00539C","bold":true,"italic":false}',Lore:['{"text":"Please don\\'t open this near","color":"gray","italic":false}','{"text":"anything valuable, ok?","color":"gray","italic":false}','{"text":"Unstable! Place deliberately!","color":"dark_red","bold":true,"italic":false}']},chance_cube:1b}`
}
