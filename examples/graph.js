
// EXAMPLE - Graph Visualizer
// Visualizes 2D and 3D graphs with colored wool blocks.

const mc = require("../mcdpi")
const packname = "math"

const depthColors = ["blue", "purple", "red", "orange", "yellow", "lime"]
const mixable = ["blue", "red", "yellow", "light_blue"]
const colorMix = [
	["blue", "red", "purple"],
	["blue", "yellow", "green"],
	["red", "yellow", "orange"],
	["light_blue", "red", "magenta"],
	["light_blue", "yellow", "lime"],
	["blue", "light_blue", "cyan"],
]

mc.startPack(packname, "Visualizes 2D and 3D graphs with colored wool blocks.")
mc.namespace(packname)

function graphPoint(x, z, color = "white")
{
	// minecraft has weird coords, flip an axis
	let pos = mc.relativeCoords(-x, 0, z)
	if (mixable.includes(color))
	{
		let validMixes = []
		for (let i = 0; i < mixable.length; i++)
		{
			let clr = mixable[i]
			if (color != clr)
			{
				let clrs = [color, clr]
				clrs.sort()
				for (let j = 0; j < colorMix.length; j++)
				{
					let mix = colorMix[j]
					if (clrs[0] == mix[0] && clrs[1] == mix[1])
					{
						validMixes.push(mix[2])
						mc.execute().if(`block ${pos} ${clr}_wool`).run(`setblock ${pos} ${mix[2]}_wool`)
					}
				}
			}
		}

		let fallback = `execute`
		for (let i = 0; i < validMixes.length; i++)
		{
			fallback += ` unless block ${pos} ${validMixes[i]}_wool`
		}
		mc.command(fallback + ` run setblock ${pos} ${color}_wool`)
	}
	else
	{
		mc.command(`setblock ${pos} ${color}_wool`)
	}
}

function graphArray(domain, range, funcs = [])
{
	for (let x = domain[0]; x <= domain[1]; x++)
	{
		for (let z = range[0]; z <= range[1]; z++)
		{
			graphPoint(x, z, (z * x) ? "white" : "black")
		}
	}

	for (let i = 0; i < funcs.length; i++)
	{
		let f = funcs[i]
		f.color = f.color ? f.color : "red"
		f.samples = f.samples ? f.samples : 10

		let points = []
		for (let x = domain[0]; x <= domain[1];)
		{
			let z = f.func(x)

			// out of domain
			if (isNaN(z))
			{
				x += 0.01
				continue
			}

			if (z >= range[0] && z <= range[1])
			{
				let rx = Math.round(x)
				let rz = Math.round(z)

				let graphed = false
				for (let p = 0; p < points.length; p++)
				{
					let pt = points[p]
					if (pt[0] == rx && pt[1] == rz)
					{
						graphed = true
						break
					}
				}
				if (!graphed)
				{
					graphPoint(rx, rz, f.color)
					points.push([rx, rz])
				}
			}

			// increment x dynamically to make sure there arent gaps
			let m = Math.abs(z - f.func(x - 0.01)) * 100
			if (isNaN(m))
			{
				m = 100
			}
			else if (m == 0)
			{
				m = 5
			}
			x += Math.min(1 / m, 0.1)
		}
	}
}

function graph3D(domain, range, func)
{
	mc.command(`fill ${mc.relativeCoords(domain[0], 0, 0)} ${mc.relativeCoords(domain[1], 0, 0)} black_wool`)
	mc.command(`fill ${mc.relativeCoords(0, 0, range[0])} ${mc.relativeCoords(0, 0, range[1])} black_wool`)

	let minMax = false
	for (let x = domain[0]; x <= domain[1]; x++)
	{
		for (let z = range[0]; z <= range[1]; z++)
		{
			let y = func(x, z)
			if (minMax)
			{
				minMax[0] = Math.min(minMax[0], y)
				minMax[1] = Math.max(minMax[1], y)
			}
			else
			{
				minMax = [y, y]
			}
		}
	}

	// make sure there's no overflow
	minMax[1] += 0.01

	for (let x = domain[0]; x <= domain[1]; x++)
	{
		for (let z = range[0]; z <= range[1]; z++)
		{
			let y = func(x, z)
			if (!isNaN(y))
			{
				let frac = (y - minMax[0]) / (minMax[1] - minMax[0])
				let color = depthColors[Math.floor(frac * depthColors.length)]
				mc.command(`setblock ${mc.relativeCoords(x, y, z)} ${color}_wool`)
			}
		}
	}
}

mc.createFunction("graph-2d", () => {
	graphArray([-40, 40], [-20, 50], [
		{
			func: (x) => {
				return x * x * x / 14
			},
			color: "red"
		},
		{
			func: (x) => {
				return x * x / 8
			},
			color: "light_blue"
		},
		{
			func: (x) => {
				return Math.sqrt(300 - x*x)
			},
			color: "yellow"
		},
		{
			func: (x) => {
				return 7 - (x / 6)
			},
			color: "blue"
		},
	])
})

mc.createFunction("graph-3d", () => {
	graph3D([-20, 20], [-20, 20], (x, z) => {
		return ((x * x) - (z * z)) / 12
	})
})
