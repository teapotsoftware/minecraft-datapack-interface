const mc = require("./../mcdpi")

module.exports = {
	id: "one-pearl-always",
	name: "One Pearl",
	desc: "Endermen always drop 1 pearl on death.",
	updated: [2, 11, 23],
	["tick-entities-fresh"]: () => {
		// endermen always drop 1 pearl
		mc.execute().as("@s[type=enderman]").run('data merge entity @s {DeathLootTable:"empty",ArmorItems:[{},{},{id:"minecraft:ender_pearl",Count:1b},{}],ArmorDropChances:[0.085F,0.085F,1.000F,0.085F]}')
	}
}