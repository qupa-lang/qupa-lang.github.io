const path = require('path');
const fs = require('fs');

const GetFiles = require('./getFiles.js');
const style = require('./style.js');

let root = path.resolve(__dirname, "../");





async function IngestArticles(){
	let files = GetFiles(root, ['.md'], ['.git', 'node_modules']);


	let md = await style.create();

	let posts = [];
	let tags = {};

	for (let file of files) {
		let raw = fs.readFileSync(file, 'utf-8');
		raw = raw.replace(/\r\n/g, '\n')

		let data = raw.split('\n---\n');
		let metaStr = data.splice(0, 1)[0];
		let desc = data.splice(0, 1)[0];
		data = data.join('\n---\n');

		// Process the body text
		let convert = md.render(data);
		let loc = "/"+path.relative(root, file.slice(0, -3) + '.html').toLowerCase().replace(/\\/g, "/");

		// Process the metadata
		let article = {};
		metaStr = metaStr.split('\n').map(x => x.split(': '));
		for (let row of metaStr) {
			article[row[0].toLowerCase()] = row[1];
		}
		if (!article.title) {
			article.title = "Unknown";
		}
		if (!article.date) {
			article.date = "Unknown";
		}
		if (article.tags) {
			article.tags = article.tags.split(/, ?/g);
		} else {
			article.tags = [];
		}
		if (article.related) {
			article.related = article.related.split(/, ?/g);
		} else {
			article.related = [];
		}
		article.description = desc || "Unknown";
		article.path = loc;
		article.body = convert;

		let id = posts.length;
		posts.push(article);

		for (let tag of article.tags) {
			if (!tags[tag]) {
				tags[tag] = [];
			}
			tags[tag].push(article);
		}
	}

	return {posts, tags};
}

module.exports = IngestArticles;