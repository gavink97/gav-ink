import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import postcssDesignTokens from '@csstools/postcss-design-tokens';
import asciidoctor from 'asciidoctor';
import cssnano from 'cssnano';
import * as esbuild from 'esbuild';
import { glsl } from 'esbuild-plugin-glsl';
import postcss from 'postcss';
import atImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import sharp from 'sharp';
import { pipeline } from 'node:stream/promises';
import { constants, createBrotliCompress, createGzip } from 'node:zlib';
const require = createRequire(import.meta.url);

const isBuild = process.argv.includes('--build') || process.argv.includes('-b');
const reBuild = process.argv.includes('--rebuild') || process.argv.includes('-r');

const assetsDir = 'assets';
const distDir = 'dist';

export async function build() {
	getassets();

	await convertAsciiDocs();
	await runsharp();

	const cssInput = `${assetsDir}/css/main.css`;
	const cssOutput = `${distDir}/css/main.css`;

	if (!fs.existsSync(path.join(distDir, 'css'))) {
		fs.mkdirSync(path.join(distDir, 'css'), { recursive: true });
	}

	const entryPoints = ['src/**/*.ts', 'src/**/*.glsl'];

	let minify = false;

	const tailwind = require('@tailwindcss/postcss');

	const postcssPlugins = [
		postcssDesignTokens({ valueFunctionName: 'token' }),
		/* postcssInitial({ reset: 'inherited' }),
        postcssAutoReset({
            reset: {
                margin: 0,
                padding: 0,
                borderRadius: 0,
            },
        }), */
		postcssPresetEnv({
			autoprefixer: {},
			stage: 2,
			features: {
				'nesting-rules': true,
			},
		}),
		tailwind(),
	];

	if (isBuild) {
		postcssPlugins.push(
			cssnano({
				preset: 'default',
			}),
		);

		minify = true;
	}

    const settings = {
        //platform: 'node',
        entryPoints: entryPoints,
        chunkNames: 'chunks/[name]-[hash]',
        outdir: './dist',
        bundle: true,
        minify: minify,
        //metafile: true,
        //splitting: true,
        //format: 'esm',
        format: 'iife',
        treeShaking: true,
        target: ['ESNext'],
        plugins: [
            glsl({
                minify: minify,
            }),
        ],
    };

	const css = fs.readFileSync(cssInput, 'utf8');

	await postcss(postcssPlugins)
		.use(atImport())
		.process(css, {
			from: cssInput,
			to: cssOutput,
		})
		.then((result) => {
			fs.writeFile(cssOutput, result.css, () => true);
			if (result.map) {
				fs.writeFile(cssOutput.concat('.map'), result.map.toString(), () => true);
			}
		});

	const ctx = await esbuild.context(settings);

	const args = `${isBuild}-${reBuild}`;

	switch (args) {
		case 'true-true':
			throw new error('Cannot build and rebuild at the same time');

		case 'true-false':
			console.log('Starting build process...');
			await esbuild.build(settings);
			break;

		case 'false-true':
			await ctx.rebuild();
			console.log('rebuilding...');
			break;

		case 'false-false':
			await ctx.watch();
			console.log('watching...');
			break;

		default:
			await ctx.watch();
			console.log('watching...');
	}
}

async function compress() {
	const files = fs.readdirSync(distDir, { withFileTypes: true, recursive: true });

    const gZip = async (file, options) => {
        await pipeline(
            fs.createReadStream(file),
            createGzip(options),
            fs.createWriteStream(`${file}.gz`)
        )
    }

    const brotli = async (file, options) => {
        await pipeline(
            fs.createReadStream(file),
            createBrotliCompress(options),
            fs.createWriteStream(`${file}.br`)
        )
    }

    await Promise.all(
        files
            .filter(file => file.isFile())
            .filter(file => file.name.endsWith('css') || file.name.endsWith('js'))
            .map(async (file) => {
                const fileName = path.join(file.parentPath, file.name)
                await gZip(fileName, { level: constants.Z_BEST_COMPRESSION });
                await brotli(fileName, {});
            })
    );
}

function main() {
	if (isBuild) {
        build()
			.catch((err) => {
				console.error('An error occurred in the build process:', err);
				process.exit(1);
			})
			.finally(() => {
				console.log('Compressing Files');
                compress().finally(() => {
				console.log('Build Complete');
				process.exit(0);
                })
			});
	} else {
		build().catch((err) => {
			console.error('An error occurred in the build process:', err);
			process.exit(1);
		});
	}
}

function getassets() {
	const assets = [
        'htmx.min.js',
        'htmx.preload.js',
        'gav.svg',
        'gav.png',
        'robots.txt'
    ];

	for (const asset of assets) {
		if (fs.existsSync(`${distDir}/${asset}`)) {
			console.log(`Skipping ${asset}`);
			continue;
		}

		fs.cp(`${assetsDir}/${asset}`, `${distDir}/${asset}`, (err) => {
			if (err) {
				throw err;
			}

			console.log(`copied ${asset} to ${distDir}`);
		});
	}
}

async function convertAsciiDocs() {
	const Asciidoctor = asciidoctor();
	require(`../${assetsDir}/converter.js`);

	const input = `${assetsDir}/studies`;
	const files = fs.readdirSync(input, { withFileTypes: true, recursive: true });

	for (const file of files) {
		if (!file.name.endsWith('adoc')) {
			continue;
		}

		const filename = file.name.split('.');
		const inputfile = path.join(input, file.name);
		const output = `${distDir}/studies/${filename[0]}/index.html`;

		Asciidoctor.convertFile(inputfile, {
			safe: 'server',
			mkdirs: true,
			to_file: output,
			standalone: false,
			backend: 'html5',
		});
	}
}

async function runsharp() {
	const inputDir = `${assetsDir}/images`;
	const outputDir = `${distDir}/images`;

	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	if (!fs.existsSync(inputDir)) {
		return;
	}

	const images = fs.readdirSync(inputDir);

	for (const image of images) {
		const inputImage = path.join(inputDir, image);
		const o = image.toLowerCase().split('.')[0].concat('.webp');
		const outputImage = path.join(outputDir, o);

		const skip = () => {
			if (fs.existsSync(outputImage)) {
				console.log(`Skipping minified image: ${o}`);
				return true;
			}
		};

		if (path.extname(image) === '.svg') {
			if (fs.existsSync(path.join(outputDir, image))) {
				console.log(`Skipping ${image}`);
				continue;
			}

			fs.cp(inputImage, path.join(outputDir, image), (err) => {
				if (err) {
					throw err;
				}

				console.log(`copied ${path.basename(image)} to ${outputDir}`);
			});
		}

		if (fs.lstatSync(inputImage).isFile()) {
			const imageExt = path.extname(image).toLowerCase();
			const exts = ['.jpg', '.jpeg', '.png', 'webp'];

			if (exts.includes(imageExt)) {
				if (skip()) continue;
				await minify(inputImage, outputImage);
			} else {
				console.log(`Skipping unsupported file format: ${image}`);
			}
		}
	}
}

// look at sharp api to see all options for image minfication
// https://sharp.pixelplumbing.com/api-utility
const minify = async (input, output) => {
	const image = sharp(input);

	image.metadata().then((metadata) =>
		image
			.resize(Math.round(metadata.width / 2))
			.webp()
			.toFile(output),
	);

	console.log(`Image minified: ${output}`);
};

main();
