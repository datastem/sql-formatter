
//let sourcearray:string[] = text.split(/\r\n/gm);
let destarray:string[] = [];

let tabcount:number = 0;
let lineindex:number = 0;
let tokenindex:number = 0;
let destindex:number = 0;

/*
			while (lineindex < sourcearray.length)
			{
				let line:string = sourcearray[lineindex].trim();

				if (line.substring(0,2) === "--")
				{
					destarray.push(sourcearray[lineindex]);
				}
				else if (line.substring(0,2) === "/*")
				{
					ProcessBlockComment(sourcearray,lineindex);
				}
				else
				{
					destarray.push(sourcearray[lineindex]);
				}
				lineindex++;
			}*/

			/*while (tokenindex < sourcearray.length)
			{
				let token = sourcearray[tokenindex].trim();
				token = token.toUpperCase();
				destindex = destarray.push(token) - 1;

				if (sqlKeywords.find(x => x.toUpperCase() === token.toUpperCase()))
				{
					if (token === "SELECT")
					{
						var result = GetEmbeddedLines(sourcearray,["FROM"],tokenindex);
						let workingarray = formatColumnList(result[0],tabcount+1);
						workingarray.forEach(col => {destarray.push(col);});
						tokenindex = result[1];
					}

					if (token === "FROM")
					{
						var result = GetEmbeddedLines(sourcearray,["WHERE", "GROUP", "ORDER"],tokenindex);
						let workingarray = formatFrom(result[0],tabcount+1);
						workingarray.forEach(col => {destarray.push(col);});
						tokenindex = result[1];
					}

					if (token === "WHERE")
					{
						var result = GetEmbeddedLines(sourcearray,["GROUP", "ORDER"],tokenindex);
						let workingarray = formatWhere(result[0],tabcount+1);
						workingarray.forEach(col => {destarray.push(col);});
						tokenindex = result[1];
					}

					if (token === "GROUP")
					{
						if (sourcearray[tokenindex+1].toUpperCase() === "BY")
						{
							destarray[destindex] = destarray[destindex] + " BY";
							tokenindex++;
						}
						var result = GetEmbeddedLines(sourcearray,["HAVING","ORDER"],tokenindex);
						let workingarray = formatColumnList(result[0],tabcount+1);
						workingarray.forEach(col => {destarray.push(col);});
						tokenindex = result[1];
					}

					if (token === "HAVING")
					{
						var result = GetEmbeddedLines(sourcearray,["ORDER"],tokenindex);
						let workingarray = formatWhere(result[0],tabcount+1);
						workingarray.forEach(col => {destarray.push(col);});
						tokenindex = result[1];
					}

					if (token === "ORDER")
					{
						if (sourcearray[tokenindex+1].toUpperCase() === "BY")
						{
							destarray[destindex] = destarray[destindex] + " BY";
							tokenindex++;
						}
						var result = GetEmbeddedLines(sourcearray,[],tokenindex);
						let workingarray = formatColumnList(result[0],tabcount+1);
						workingarray.forEach(col => {destarray.push(col);});
						tokenindex = result[1];
					}

				}
				tokenindex++;
			}*/

/*
function RegExBlockOfCode(source : string) : string[]
{
	//Remove all line feeds, carriage returns, tabs, and spaces and replace with a single space
	let regex:RegExp = /\s+/gm;
	let subst:string = '\x20';  //space character
	source = source.replace(regex,subst);

	//Remove all spaces preceding or following a comma, but leaving the space + comma
	regex = /\s?(,)\s?/g;
	subst = ' ,';
	source = source.replace(regex,subst);

	//Remove all spaces following an open parenthesis or preceding a close parenthises, and leave the parenthesis
	regex = /([(])\s|\s([)])/g;
	subst = '$1$2';
	source = source.replace(regex,subst);

	//Remove all spaces preceding or following a comparison operator, leave the operator
	regex = /\s*(=|<|>|\+|-|\*|\/|%|<=|>=|!=|<>|!<|!>)\s/gm;
	subst = ' $1 ';
	source = source.replace(regex,subst);

	return source.split(/\s+/g);
}

function ProcessBlockComment(srcarray:string[],index:number) //: [string[], number]
{
	const blockCommentRegex = /\/\*[\s\S]*?\*\//gm;
	const blockComments = srcarray.toString().match(blockCommentRegex);
	let result:string[] = [];

	//return [result,0];
}

function GetEmbeddedLines(srcarray : string[], endtokens: string[], startindex: number) : [string[], number]
{
	let endindex:number = srcarray.map(token => token.toUpperCase()).findIndex(x => endtokens.includes(x), startindex+1);
	if (endindex === -1)
	{
		endindex = srcarray.length;
	}
	let columnarray:string[] = [];
	for(let i = startindex+1; i < endindex; i++) 
	{
		columnarray.push(srcarray[i]);
	}
	startindex = endindex-1;
	return [columnarray, startindex];
}


function formatColumnList(workarray : string[], tabcount : number) : string[]
{
	let result:string[] = [];
	let tabs:string = tabchar.repeat(tabcount);
	let comma:string = "";

	workarray.forEach(token => {
		token = tabchar.repeat(tabcount) + comma +  token.trim();
		result.push(token);
		comma = ",";
	});

	return result;
}

function formatFrom(workarray : string[], tabcount : number) : string[]
{
	let result:string[] = [];

	workarray.forEach(token => {
		token = tabchar.repeat(tabcount) + token;
		result.push(token);
	});

	return result;
}

function formatWhere(workarray : string[], tabcount : number) : string[]
{
	let result:string[] = [];
	let opindex:number = workarray.findIndex(x => operators.includes(x));
	let optoken:string = "";

	if (opindex === -1)
	{
		let a1:string[]	= customSplit(workarray[0],operators);
		opindex = a1.findIndex(x => operators.includes(x));
		optoken = tabchar.repeat(tabcount) + a1[opindex-1] + " " + a1[opindex] + " " + a1[opindex+1];
	}
	else
	{
		optoken = tabchar.repeat(tabcount) + workarray[opindex-1] + " " + workarray[opindex] + " " + workarray[opindex+1];
	}
	result.push(optoken);

	return result;
}

function customSplit(input: string, delimiters: string[]): string[] 
{
    const result: string[] = [];
    let currentWord = '';

    for (const char of input) 
	{
		if (delimiters.includes(char)) 
		{
			if (currentWord) 
			{
				result.push(currentWord);
				currentWord = '';
			}
		} 
		currentWord += char;

		if (delimiters.includes(currentWord))
		{
			result.push(currentWord);
			currentWord = '';
		}
    }

    if (currentWord) {
        result.push(currentWord);
    }

    return result;
}

function splitStringWithAssertions(input: string): string[] {
    const regex = /(?<=\d)(?=\D)/; // Lookbehind for a digit and lookahead for a non-digit
    return input.split(regex);
}
*/
