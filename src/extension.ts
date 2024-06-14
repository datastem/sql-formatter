// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import  { sqlKeywords,tabchar,operators  } from './declarations';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "datastem-sql-formatter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('datastem-sql-formatter.formatsql', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from DataStem SQL Formatter!');

		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			// Get the word within the selection
			let text = "";
			let range = new vscode.Range(document.positionAt(0),document.lineAt(document.lineCount - 1).range.end);
			if (selection && !selection.isEmpty)
			{
				text = document.getText(selection);
				range = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
			}
			else
			{
				text = document.getText();
				range = new vscode.Range(document.positionAt(0),document.lineAt(document.lineCount - 1).range.end);
			}

			//let sourcearray:string[] = text.split(/[\s+;(),]/);
			let sourcearray:string[] = text.split(/\s+([\s;(),])/gm);
			//sourcearray = sourcearray.filter(c => c);
			//let sourcearray:string[] = text.split(' ');
			let destarray:string[] = [];
			let tabcount:number = 0;
			let tokenindex:number = 0;
			let destindex:number = 0;

			while (tokenindex < sourcearray.length)
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
			}

			editor.edit(editBuilder => {
				//editBuilder.replace(selection, reversed);
				editBuilder.replace(range, destarray.join("\n"));
			});
		}

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}


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