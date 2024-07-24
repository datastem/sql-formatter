import  { sqlKeywords,tabchar,operators  } from './declarations';

const lineComments:string[] = [];
const blockComments:string[] = [];
const selectClauses:string[] = [];

// Function to format block comments
function formatBlockComments(code: string, direction: string): string 
{
    const blockCommentRegex = /\/\*[\s\S]*?\*\//g;

    if (direction === "remove")
    {
        code = code.replace(blockCommentRegex, (match) => {
            blockComments.push(match);
            return `__BLOCK_COMMENT_${blockComments.length - 1}__`;
          });
    }
    else
    {
        // Restore block comments
        code = code.replace(/__BLOCK_COMMENT_(\d+)__/g, (match, index) => blockComments[Number(index)]);   
    }
    return code;
}

// Function to format single-line comments
function formatSingleLineComments(code: string, direction:  string): string 
{
    const lineCommentRegex = /(--.*?$)/gm;

    if (direction === "remove")
    {
        // Replace line comments with placeholders
        code = code.replace(lineCommentRegex, (match) => {
            lineComments.push(match);
            return `__LINE_COMMENT_${lineComments.length - 1}__`;
        });
    }
    else
    {
        // Restore line comments
        code = code.replace(/__LINE_COMMENT_(\d+)__/g, (match, index) => lineComments[Number(index)]);
    }
    return code;
}

// Function to format SQL keywords
function formatKeywords(code: string): string 
{
    const keywordPattern = `\\b(${sqlKeywords.join('|')})\\b`;
    const keywordRegex = new RegExp(keywordPattern, 'gi');

    code = code.replace(keywordRegex, match => match.toUpperCase());

    return code.replace(/\x20+/g, match => ` `);
}

// Function to format operators
function formatOperators(code: string): string 
{
    const operatorPattern = `\\s*(${operators.join('|')})\\s*`;
    const operatorRegex = new RegExp(operatorPattern,'g');

    return code.replace(operatorRegex, (match, operator) => ` ${operator.trim()} `);
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

function extractSelectClause(code: string)
{
    const fromArray = Array.from(code.matchAll(/FROM/gd));
    let selectArray = Array.from(code.matchAll(/SELECT/gd));
    
    let selectClauseArray:[number,number][] = [];

    console.log(selectArray);
    console.log(fromArray);

    for (const from of fromArray)
    {
        const fromIndex = from.index;
        let i:number = selectArray.length;
        let selectIndex:number = -1;
        while (i > 0)
        {
            i--;
            if (selectArray[i].index < fromIndex && selectIndex < 0)
            {
                selectIndex = selectArray[i].index;
                selectArray.splice(i,1);
            }
        }
        selectClauseArray.push([selectIndex,fromIndex]);
    }
    console.log(selectClauseArray);
}


// Function to format the entire SQL code
export function formatSQLCode(code: string): string 
{
    let formattedCode = code;
    formattedCode = formatBlockComments(formattedCode,"remove");
    formattedCode = formatSingleLineComments(formattedCode,"remove");

    formattedCode = formatOperators(formattedCode);
    formattedCode = formatKeywords(formattedCode);

    let codearray:string[] = formattedCode.split(/\r\n/g);
    let tokenarray:string[] = [];
    let formattedarray:string[] = [];

    let tabcount:number = 0;
    let lineindex:number = 0;
    let tokenindex:number = 0;
    let destindex:number = 0;

    //console.log(formattedCode);

    extractSelectClause(formattedCode);
    
    while (lineindex < codearray.length)
    {
        const blockCommentRegex = /^\s*__BLOCK_COMMENT_(\d+)__\s*$/;
        const lineCommentRegex = /^\s*__LINE_COMMENT_(\d+)__\s*$/;

        if (codearray[lineindex].trim() === "" || blockCommentRegex.test(codearray[lineindex]) || lineCommentRegex.test(codearray[lineindex]))
        {
            formattedarray.push(codearray[lineindex]);
            lineindex++;
        }
        else
        {
            tokenarray = codearray[lineindex].split(/\s/);

            while (tokenindex < tokenarray.length)
            {
                let token = tokenarray[tokenindex].trim();

                if (sqlKeywords.find(x => x.toUpperCase() === token.toUpperCase()))
                {
                    if (token === "SELECT")
                    {
                        var result = GetEmbeddedLines(codearray,["FROM"],lineindex);
                        //let workingarray = formatColumnList(result[0],tabcount+1);
                        //workingarray.forEach(col => {destarray.push(col);});
                        lineindex = result[1];
                    }
                    /*
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
                    */
                }
                tokenindex++;
            }
            lineindex++;
        }
    }

    formattedCode = formatBlockComments(formattedCode,"add");
    formattedCode = formatSingleLineComments(formattedCode,"add");
    formattedCode = formattedCode.replace(/(\r\n){2,}/g, match => '\r\n\r\n');

    return formattedCode;
}
