/**
 * Reads in TeX file for a problem
 */


/**
 * Used by the Parser to separate tokens into types, which can be handled differently.
 *
 * BEGIN: either a \begin{} or a BEGIN_METADATA -- denotes a structure with marked begininning
 *	      and ending
 * END: end of a BEGIN
 * CSV_BEGIN: CSVs need to be processed differently than other values. This token indicates that
 *			  what follows should be processed as a CSV
 * CSV: a CSV value
 * TEXT: actual text values, such as problem code or metadata values
 * METADATA: A mark that what follows is a metadata value
 * QUESTION: Each problem tree is rooted by a QUESTION (\question)
 */
const types = {
	BEGIN: 'begin',
	END: 'end',
	OPEN: 'open',
	CSV_BEGIN: 'csv_begin',
	CSV: 'csv',
	TEXT: 'text',
	METADATA: 'metadata',
	QUESTION: 'question'
}

/*
 * Used for creating syntax tree from a problem file.
 */
class Token {
	constructor(type, value) {
		this.type = type;
		this.value = value;
	}
}

/**
 * Leaves of syntax tree, which are Tokens. Has list of children.
 */
class ProblemSyntaxTreeLeaf {
	constructor(token) {
		this.token = token;
		this.children = [];
	}
}

/**
 * Just holds the root of the tree, with methods for searching/processing
 */
class ProblemSyntaxTree {
	constructor(root) {
		this.root = root;
	}

	traverse() {
		this.printChildren(this.root);
	}

	printChildren(leaf) {
		console.log(leaf.token);
		for (const child of leaf.children) {
			this.printChildren(child);
		}
	}
}

/**
 * Used to gather tokens from a tex file in order to create syntax tree
 * Keeps the text as a list of words, with no whitespace.
 */
class Scanner {
	constructor(text) {
		this.text = text.split(/\s/);
		this.curPos = 0;
		this.prevToken = null;
		this.inMetadata = false;
	}

	/**
	 * Reads in text values when we have a word which doesn't handle control flow.
	 * Needs to behave somewhat differently inside of metadata, but that's okay.
	 */
	gatherText() {
		var type = types.TEXT;
		if (this.inMetadata) {
			type = types.METADATA;

			if (this.text[this.curPos] == '%' || this.text[this.curPos] == '%%') {
				return new Token(types.END, 'METAVALUE');
			}
		}

		var value = this.text[this.curPos];
		if (this.prevToken.type == types.CSV_BEGIN) {
			while (this.curPos + 1 < this.text.length && this.text[this.curPos + 1][0] != '%') {
				this.curPos++;
				value = value + ' ' + this.text[this.curPos];
			}
			type = types.CSV;
		}
		return new Token(type, value);
	}

	/**
	 * Hacky as hell, but need to ignore first comment in metadata
	 */
	eatComment() {
		while (this.text[this.curPos + 1] == '%' || this.text[this.curPos + 1] == '%%') {
			this.curPos++;
		}
	}

	/**
	 * Takes the next piece of text and creates a token for parser. Kind of a mess; this is where all
	 * logic on keywords goes.
	 */
	getNextToken() {
		if (this.curPos > text.length) {
			return token = new Token(types.END, 'FILE');
		}

		var token = null;
		switch (this.text[this.curPos]) {
			case '\\question':
				token = new Token(types.QUESTION, 'QUESTION');
				break;
			case 'BEGIN_METADATA':
				token = new Token(types.BEGIN, 'METADATA');
				this.inMetadata = true;
				this.eatComment();
				break;
			case 'END_METADATA':
				token = new Token(types.END, 'METADATA');
				this.inMetadata = false;
				break;
			case 'UNIQUE_ID:':
				token = new Token(types.BEGIN, 'UNIQUE_ID');
				break;
			case 'PROBLEM_ID:':
				token = new Token(types.BEGIN, 'PROBLEM_ID');
				break;
			case 'TIMESTAMP:':
				token = new Token(types.BEGIN, 'TIMESTAMP');
				break;
			case 'TAGS:':
				token = new Token(types.CSV_BEGIN, 'TAGS');
				break;
			case 'IN_WORKSHEETS:':
				token = new Token(types.CSV_BEGIN, 'IN_WORKSHEETS');
				break;
			case '\\begin{parts}':
				token = new Token(types.BEGIN, 'PARTS');
				break;
			case '\\end{parts}':
				token = new Token(types.END, 'PARTS');
				break;
			case '\\part':
				token = new Token(types.OPEN, 'PART');
				break;
			case '\\begin{solution}':
				token = new Token(types.BEGIN, 'SOLUTION');
				break;
			case '\\end{solution}':
				token = new Token(types.END, 'SOLUTION');
				break;
			case '':
				token = new Token(types.END, 'FILE');
				break;
			default:
				token = this.gatherText();

		}

		this.prevToken = token;
		this.curPos++;
		return token;
	}

}


/**
 * Takes in our Scanner to build a ProblemSyntaxTree.
 */
class Parser {
	constructor(scanner) {
		this.scanner = scanner;
		this.curToken = this.scanner.getNextToken();
		this.syntaxTree = new ProblemSyntaxTree(this.populateChildren(new ProblemSyntaxTreeLeaf(this.curToken)));
	}

	populateChildren(leaf) {
		var children = [];
		var finished = false;
		while (!finished) {
			var next = this.processNextToken();
			if (next.token.type == types.END) {
				finished = true;
			} else {
				children.push(next);
			}
		}
		leaf.children = children;
		return leaf;
	}

	/**
	 * If something special needs to be done based on token type, do it here.
	 */
	processNextToken() {
		this.curToken = this.scanner.getNextToken();
		var nextLeaf = new ProblemSyntaxTreeLeaf(this.curToken);
		switch (this.curToken.type) {
			case types.BEGIN:
			case types.CSV_BEGIN:
				this.populateChildren(nextLeaf);
				break;
		}

		return nextLeaf;
	}

}