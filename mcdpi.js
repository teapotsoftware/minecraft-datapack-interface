
/*
                 MCDPI
      Minecraft Datapack Interface
   Made by Nicholas Bervar 2019-2021

  NodeJS script to generate mcfunction
  files. This whole thing could use a
  rewrite.
*/

const fs = require("fs")

// compiling modes
MODE_DEFAULT = 0
MODE_DEBUG = 1
MODE_SPEED = 2

let mc = {}
mc.__meta = {mode: MODE_DEFAULT, writing: false, root: "", curFunc: {path: "", name: ""}, pack: {name: "", desc: "", format: 0}, namespace: "", hooks: {}, lines: {}, markers: [], marks: {}, wrotePredicates: {}, wroteFunctions: {}}

/*          Enumerate with numbers - don't use actual enums          */
mc.enums = {}
mc.enums.COORDS_ABOSLUTE = 0
mc.enums.COORDS_TILDE = 1
mc.enums.COORDS_CARET = 2
mc.enums.PARAMS_LIST = 0
mc.enums.PARAMS_INCREMENTAL = 1
mc._coordTypeTranslator = ["", "~", "^"]

/*          Custom-colored compiler prints          */
mc.echo = function(txt) {if (mc.__meta.mode != MODE_SPEED) {console.log("\x1b[32m%s\x1b[0m", txt)}}
mc.warn = function(txt) {console.log("\x1b[33m%s\x1b[0m", txt)}
mc.error = function(txt) {console.log("\x1b[31m%s\x1b[0m", txt)}

mc.root = function(dir) {mc.__meta.root = dir}
mc.compilerMode = function(mode) {mc.__meta.mode = mode}

mc.lineCount = function()
{
	if (mc.__meta.mode == MODE_DEBUG)
	{
		mc.echo("\n==== LINE COUNT REPORT ====")
		let tot = 0
		for (const file in mc.__meta.lines)
		{
			mc.echo(file + " -> " + mc.__meta.lines[file])
			tot += mc.__meta.lines[file]
		}
		mc.echo("TOTAL LINE COUNT -> " + tot + "\n")
	}
	else
		mc.warn("DEBUG MODE DISABLED - CANT GIVE LINE COUNT")
}

mc.markReport = function()
{
	if (mc.__meta.mode == MODE_DEBUG)
	{
		mc.echo("\n==== MARK REPORT ====")
		console.log(mc.__meta.marks)
	}
	else
		mc.warn("DEBUG MODE DISABLED - CANT GIVE MARK REPORT")
}

mc.addMarker = function(marker) {mc.__meta.markers.push(marker)}

mc._addlines = function(file, data)
{
	let amt = data.split('\n').length
	if (typeof mc.__meta.lines[file] == "undefined")
		mc.__meta.lines[file] = amt
	else
		mc.__meta.lines[file] += amt

	// for really long functions print dots just to show we're still alive
	// if (Math.floor(mc.__meta.lines))

	for (let i = 0; i < mc.__meta.markers.length; i++)
	{
		let marker = mc.__meta.markers[i]
		let warnings = data.split(marker).length - 1
		if (warnings > 0)
		{
			if (typeof mc.__meta.marks[file] == "undefined")
				mc.__meta.marks[file] = {}

			if (typeof mc.__meta.marks[file][marker] == "undefined")
				mc.__meta.marks[file][marker] = warnings
			else
				mc.__meta.marks[file][marker] += warnings
		}
	}
}

mc._mkdir = function(d)
{
	if (!fs.existsSync(mc._rootDir() + d))
	{
		fs.mkdirSync(mc._rootDir() + d, {recursive: true})
	}
}

mc._rootDir = function()
{
	if (mc.__meta.root == "")
		return ""
	else
		return mc.__meta.root + "/"
}

mc._write = function(file, data)
{
	if (mc.__meta.mode == MODE_DEBUG)
		mc._addlines(file, data)
	if (fs.existsSync(mc._rootDir() + file))
	{
		fs.unlinkSync(mc._rootDir() + file)
	}
	fs.writeFileSync(mc._rootDir() + file, data)
}

mc._append = function(file, data)
{
	if (mc.__meta.mode == MODE_DEBUG)
		mc._addlines(file, data)
	fs.appendFileSync(mc._rootDir() + file, data + "\n")
}

mc._namespaceDir = function(ns = mc.__meta.namespace)
{
	return mc.__meta.pack.name + "/data/" + ns + "/"
}

mc.startPack = function(name, desc = "", format = 7)
{
	// if (mc.__meta.root != "")
	// 	fs.rmdirSync(dir, {recursive: true});
	mc.__meta.pack.name = name
	mc.__meta.pack.desc = desc
	mc.__meta.pack.format = format
	mc.__meta.hooks = {}
	mc.__meta.wrotePredicates = {}
	mc.__meta.wroteFunctions = {}
	mc._mkdir(name)
	mc._mkdir(name + "/data")
	mc._write(name + "/pack.mcmeta", "{\"pack\":{\"pack_format\":" + format + ",\"description\":\"" + desc + "\"}}")
	mc.echo("Created pack " + name + " (" + desc + ")")
}

/*          Function argument for indentation consistency          */
mc.namespace = function(ns, func = false)
{
	mc.echo("Created namespace " + ns)
	if (func)
	{
		let oldNamespace = mc.__meta.namespace
		mc.__meta.namespace = ns
		mc._mkdir(mc._namespaceDir())
		func()
		mc.__meta.namespace = oldNamespace
	}
	else
	{
		mc.__meta.namespace = ns
		mc._mkdir(mc._namespaceDir())
	}
}

/*          Basic predicate and advancement support          */

mc.addPredicate = function(id, condition, keys, values)
{
	// basic guard against duplicates slowing down compiles
	if (typeof mc.__meta.wrotePredicates[mc.__meta.namespace + ":" + id] != "undefined")
		return
	mc.__meta.wrotePredicates[mc.__meta.namespace + ":" + id] = true

	mc._mkdir(mc._namespaceDir() + "predicates")
	let kvStr = ""

	for (let i = 0; i < keys.length; i++)
	{
		let val = values[i]
		if (typeof val == "string")
			val = '"' + val + '"'

		kvStr += '"' + keys[i] + '":' + values[i]

		if (i + 1 < keys.length)
			kvStr += ","
	}

	if (kvStr != "")
		kvStr = "," + kvStr

	mc._write(mc._namespaceDir() + "predicates/" + id + ".json", '{"condition":"minecraft:' + condition + '"' + kvStr + '}')
	mc.echo("Created predicate " + id)
}

mc.hookAdvancement = function(id, trigger, conditions, func)
{
	mc.createFunction("adv-" + id, func)
	mc._mkdir(mc._namespaceDir() + "advancements")
	let obj = {criteria: {}}
	obj.criteria[id] = {}
	obj.criteria[id].trigger = "minecraft:" + trigger
	obj.criteria[id].conditions = conditions
	obj.rewards = {function: mc.__meta.namespace + ":adv-" + id}
	mc._write(mc._namespaceDir() + "advancements/" + id + ".json", JSON.stringify(obj))
	mc.echo("Created advancement " + id)
}

/*          Recipes          */

// TODO: support for array of ingredints in shaped recipes
mc.shapedRecipe = function(id, shape, key, result, count = 1)
{
	mc._mkdir(mc._namespaceDir() + "recipes")
	let shapeStr = ""
	for (let i = 0; i < shape.length; i++)
	{
		shapeStr += '"' + shape[i] + '"'
		if (i + 1 < shape.length)
		{
			shapeStr += ","
		}
	}
	let keyStr = ""
	for (let i = 0; i < key.length; i++)
	{
		keyStr += '"' + key[i][0] + '":{"item":"minecraft:' + key[i][1] + '"}'
		if (i + 1 < key.length)
		{
			keyStr += ","
		}
	}
	mc._write(mc._namespaceDir() + "recipes/" + id + ".json", '{"type":"crafting_shaped","pattern":[' + shapeStr + '],"key":{' + keyStr + '},"result":{"item":"minecraft:' + result + '","count":' + count + '}}')
	mc.echo("Created recipe " + mc._namespaceDir() + "recipes/" + id + ".json (shaped)")
}

mc.shapelessRecipe = function(id, key, result, count = 1)
{
	mc._mkdir(mc._namespaceDir() + "recipes")
	let keyStr = ""
	for (let i = 0; i < key.length; i++)
	{
		let ing = key[i]
		if (typeof ing == "string")
		{
			keyStr += '{"item":"minecraft:' + key[i] + '"}'
		}
		else
		{
			let arrStr = "["
			for (let j = 0; i < ing.length; j++)
			{
				arrStr += '{"item":"minecraft:' + ing[i] + '"}'
				if (j + 1 < ing.length)
				{
					arrStr += ","
				}
			}
			keyStr += arrStr + "]"
		}
		if (i + 1 < key.length)
		{
			keyStr += ","
		}
	}
	mc._write(mc._namespaceDir() + "recipes/" + id + ".json", '{"type":"crafting_shapeless","ingredients":[' + keyStr + '],"result":{"item":"minecraft:' + result + '","count":' + count + '}}')
}

/*          Type tags          */

mc.tagType = {
	blocks: "blocks",
	entities: "entity_types",
	fluids: "fluids",
	functions: "functions",
	items: "items",
}

mc.addTag = function(type, id, list, replace = false)
{
	mc._mkdir(mc._namespaceDir() + "tags")
	mc._mkdir(mc._namespaceDir() + "tags/" + type)
	let keyStr = ""
	for (let i = 0, n = list.length; i < n; i++)
	{
		keyStr += '"' + list[i] + '"'
		if (i + 1 < n)
		{
			keyStr += ","
		}
	}
	mc._write(mc._namespaceDir() + "tags/" + type + "/" + id + ".json", '{"replace":' + replace + ',"values":[' + keyStr + ']}')
}

/*          Functions          */

mc.writeToFunction = function(name)
{
	mc.__meta.curFunc.name = name
	mc.__meta.curFunc.path = mc._namespaceDir() + "functions/" + name + ".mcfunction"
}

mc.createFunction = function(name, funcOrParams, funcWithParams = false)
{
/*          guard against duplicates slowing down compiles          */
	if (typeof mc.__meta.wroteFunctions[mc.__meta.namespace + ":" + name] != "undefined")
		return
	mc.__meta.wroteFunctions[mc.__meta.namespace + ":" + name] = true
/*          guard against duplicates slowing down compiles          */

	mc._mkdir(mc._namespaceDir() + "functions")
	
	let oldFunc = mc.__meta.curFunc.name
	if (typeof funcOrParams == "function")
	{
		mc.writeToFunction(name)
		funcOrParams()
	}
	else if (typeof funcWithParams == "function")
	{
		let prm = funcOrParams.params;
		switch (funcOrParams.type)
		{
			case mc.enums.PARAMS_INCREMENTAL:
				for (let i = prm[0]; i <= prm[1]; i += prm[2])
				{
					mc.writeToFunction(name + "-" + i)
					funcWithParams(i)
				}
				break

			// default is PARAMS_LIST
			default:
				for (let i = 0; i < prm.length; i++)
				{
					let n = prm[i]
					mc.writeToFunction(name + "-" + n)
					funcWithParams(n)
				}
				break
		}
	}
	else
	{
		throw "Bad arguments to createFunction"
	}
	mc.echo("Created function " + mc._namespaceDir() + name + ".mcfunction")
	mc.writeToFunction(oldFunc)
}

mc.createTimerFunction = function(name, times, delay, loop, func, multirun = -1)
{
	// if no parameter is specified for whether this timer
	// should be unique, make sure looping timers are unique
	if (multirun == -1)
	{
		multirun = !loop
	}

	// create boring function to start the timer
	mc.createFunction(name, () => {
		mc.callFunction(name + "_t1")
		for (let i = 1; i <= times; i++)
		{
			if (i != times)
			{
				mc.scheduleFunction(name + "_t" + ((i % times) + 1), delay * i, multirun)
			}
		}
	})

	for (let i = 1; i <= times; i++)
	{
		mc.createFunction(name + "_t" + i, () => {
			if (func(i) && i == times && loop)
			{
				mc.scheduleFunction(name, delay, multirun)
			}
		})
	}
}

// mc.command and derivatives

mc.command = function(cmd) {mc._append(mc.__meta.curFunc.path, cmd)}
mc.callFunction = function(func, param = false) {mc.command("function " + mc.__meta.namespace + ":" + func + (param ? "-" + param : ""))}
mc.scheduleFunction = function(func, ticks, multirun = false) {mc.command("schedule function " + mc.__meta.namespace + ":" + func + " " + ticks + (multirun ? " append" : ""))}

mc.addObjective = function(name, criteria = "dummy", displayName = false, deleteStale = true) {
	if (deleteStale)
		mc.command(`scoreboard objectives remove ${name}`)
	if (displayName)
		mc.command(`scoreboard objectives add ${name} ${criteria} ${displayName}`)
	else
		mc.command(`scoreboard objectives add ${name} ${criteria}`)
}

let _scoreFuncs = [["set", "set"], ["add", "add"], ["subtract", "remove"], ["remove", "remove"]]

for (let i in _scoreFuncs)
{
	let j = _scoreFuncs[i]
	mc[`${j[0]}Score`] = function(a, b, c = false)
	{
		if (c === false)
			mc.command(`scoreboard players ${j[1]} @s ${a} ${b}`)
		else
			mc.command(`scoreboard players ${j[1]} ${a} ${b} ${c}`)
	}
}

/*
mc.setScore = function(a, b, c = false)
{
	if (c != false)
		mc.command("scoreboard players set " + a + " " + b + " " + c)
	else
		mc.command("scoreboard players set @s " + a + " " + b)
}

mc.addScore = function(a, b, c = false)
{
	if (c != false)
		mc.command("scoreboard players add " + a + " " + b + " " + c)
	else
		mc.command("scoreboard players add @s " + a + " " + b)
}

mc.subtractScore = function(a, b, c = false)
{
	if (c != false)
		mc.command("scoreboard players remove " + a + " " + b + " " + c)
	else
		mc.command("scoreboard players remove @s " + a + " " + b)
}
*/

mc.delayedEvent = function(suffix, delay, func)
{
	let name = mc.__meta.curFunc.name + "-" + suffix
	mc.scheduleFunction(name, delay, true)
	mc.createFunction(name, func)
}

mc.coords = function(x = 0, y = 0, z = 0, type = mc.enums.COORDS_ABOSLUTE)
{
	let obj = {x: x, y: y, z: z, type: type}
	obj.toString = function()
	{
		let chr = mc._coordTypeTranslator[obj.type]
		return chr + obj.x + " " + chr + obj.y  + " " + chr + obj.z
	}
	return obj
}

mc.relativeCoords = function(x = 0, y = 0, z = 0)
{
	let obj = mc.coords(x, y, z)
	obj.type = mc.enums.COORDS_TILDE
	return obj
}

let executeParameters = ["as", "at", "align", "positioned", "anchored", "in", "rotated", "if", "unless", "store"]

mc.execute = function(txt = "execute")
{
	let obj = {}
	for (let i = 0; i < executeParameters.length; i++)
	{
		let seg = executeParameters[i]
		obj[seg] = function(x) {return mc.execute(txt + " " + seg + " " + x)}
	}
	obj.predicate = function(id)
	{
		return mc.execute(txt + " if predicate " + mc.__meta.namespace + ":" + id)
	}
	obj.percent = function(pct)
	{
		mc.addPredicate("percent-" + pct, "random_chance", ["chance"], [pct / 100])
		return mc.execute(txt + " if predicate " + mc.__meta.namespace + ":percent-" + pct)
	}
	obj.run = function(cmd, func = false)
	{
		if (func)
		{
			let newFunc = mc.__meta.curFunc.name + "-" + cmd
			mc.createFunction(newFunc, func)
			mc._append(mc.__meta.curFunc.path, txt + " run function " + mc.__meta.namespace + ":" + newFunc)
		}
		else
		{
			mc._append(mc.__meta.curFunc.path, txt + " run " + cmd)
		}
	}
	obj.recurse = function()
	{
		mc._append(mc.__meta.curFunc.path, txt + " run function " + mc.__meta.namespace + ":" + mc.__meta.curFunc.name)
	}
	return obj
}

mc.hook = function(func, name, ns = "minecraft")
{
	let pack = mc.__meta.pack.name
	let namespace = mc.__meta.namespace
	mc._mkdir(`${pack}/data/${ns}`)
	mc._mkdir(`${pack}/data/${ns}/tags`)
	mc._mkdir(`${pack}/data/${ns}/tags/functions`)
	let funcName = `"${namespace}:${func}"`
	if (typeof mc.__meta.hooks[name] == "undefined")
	{
		mc.__meta.hooks[name] = [funcName]
	}
	else
	{
		mc.__meta.hooks[name].push(funcName)
	}
	mc._write(`${pack}/data/${ns}/tags/functions/${name}.json`, `{"replace":"false","values":[${mc.__meta.hooks[name].toString()}]}`)
}

// statue-related

let base_height = -0.7 // no idea but seems close enough
let head_size = 0.4375

mc.statuePiece = function(item, pos = mc.coords(), tags = [])
{
	for (let i = 0; i < 3; i++)
	{
		pos["xyz"[i]] *= head_size
	}
	pos.y += base_height
	pos.type = mc.enums.COORDS_TILDE
	tags.push("statue_piece")
	mc.command("summon armor_stand " + pos + " {Tags:[" + tags + "],Small:1,DisabledSlots:4096,Invisible:1,NoGravity:1,ArmorItems:[{},{},{},{Count:1,id:\"minecraft:" + item + "\"}]}")
}

mc.buildStatue = function(name, pieces)
{
	for (let i = 0; i < pieces.length; i++)
	{
		mc.statuePiece(pieces[i].item, pieces[i].pos, [name])
	}
}

mc.destroyStatue = function(name, pos = false, limit = 1)
{
	if (pos)
	{
		mc.command("execute positioned " + pos + " run kill @e[tag=statue_piece,tag=" + name + ",sort=nearest,limit=" + limit + "]")
	}
	else
	{
		mc.command("kill @e[tag=statue_piece,tag=" + name + "]")
	}
}

// team commands

mc.removeTeam = function(id) {mc.command("team remove " + id)}

// "effects" like in source engine

mc.createEffect = function(name, particles, sounds = [])
{
	let oldFunc = mc.__meta.curFunc.name
	mc.startFunc("eff-" + name + "-prt")
	for (let i = 0; i < particles.length; i++)
	{
		let prt = particles[i]
		if (!prt.name)
		{
			continue
		}
		prt.pos = (prt.pos ? prt.pos : mc.coords())
		prt.params = (prt.params ? " " + prt.params : "")
		prt.delta = (prt.delta ? prt.delta : mc.coords())
		prt.speed = (prt.speed ? prt.speed : 0.1)
		prt.count = (prt.count ? prt.count : 1)
		prt.renderMode = (prt.renderMode ? prt.renderMode : "force")
		prt.target = (prt.target ? prt.target : "@a")
		prt.pos.type = mc.enums.COORDS_TILDE
		mc.command("particle " + prt.name + prt.params + " " + prt.pos + " " + prt.delta + " " + prt.speed + " " + prt.count + " " + prt.renderMode + " " + prt.target)
	}
	mc.startFunc("eff-" + name + "-snd")
	for (let i = 0; i < sounds.length; i++)
	{
		let snd = sounds[i]
		if (!snd.name)
		{
			continue
		}
		snd.src = (snd.src ? snd.src : "master")
		snd.targets = (snd.targets ? snd.targets : "@a")
		snd.pos = (snd.pos ? snd.pos : mc.coords())
		snd.volume = (snd.volume ? snd.volume : 1)
		snd.pitch = (snd.pitch ? snd.pitch : 1)
		snd.minVolume = (snd.minVolume ? snd.minVolume : 0)
		snd.pos.type = mc.enums.COORDS_TILDE
		mc.command("playsound " + snd.name + " " + snd.src + " " + snd.targets + " " + snd.pos + " " + snd.volume + " " + snd.pitch + " " + snd.minVolume)
	}
	mc.appendfunc(oldFunc)
}

mc.dispatchEffect = function(name, no_sound = false)
{
	mc.command("eff-" + name + "-prt")
	if (!no_sound)
	{
		mc.command("eff-" + name + "-snd")
	}
}

// switch macros (requires "var" dummy variable)

mc.switchRandom = function(id, amt, func)
{
	mc.command(`scoreboard players set #${id} var 0`)
	for (let i = 0; i < 16; i++)
		mc.execute().percent(50).run(`scoreboard players add #${id} var ${Math.pow(2, i)}`)
	mc.command(`scoreboard players set #${id}_max var ${amt}`)
	mc.command(`scoreboard players operation #${id} var %= #${id}_max var`)
	for (let i = 0; i < amt; i++)
		mc.execute().if(`score #${id} var matches ${i}`).run(i, () => {func(i)})
}

// node export
module.exports = mc;
