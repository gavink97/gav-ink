import * as fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const OpalBuilder = require('opal-compiler').Builder;

async function main() {
	const assetsDir = 'assets';

	const builder = OpalBuilder.create();
	builder.appendPaths('lib');
	const result = builder.build('./build/converter.rb');
	fs.writeFileSync(`${assetsDir}/converter.js`, result.toString(), 'utf8');
}

main();
