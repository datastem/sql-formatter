// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import  { sqlKeywords,tabchar  } from './declarations';

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
			let oldtextarray:string[] = text.split(" ");
			let newtextarray:string[] = [];
			let tabcount:number = 0;
			let tokenindex:number = 0;

			while (tokenindex < oldtextarray.length)
			{
				let token = oldtextarray[tokenindex];
				token = token.toUpperCase();
				newtextarray.push(token.trim());

				if (sqlKeywords.find(x => x.toUpperCase() === token.toUpperCase()))
				{
					if (token === "SELECT")
					{
						tabcount++;
						let fromindex:number = oldtextarray.map(token => token.toUpperCase()).indexOf("FROM",tokenindex);
						if (fromindex === -1)
						{
							fromindex = oldtextarray.length+1;
						}
						let columnarray:string[] = [];
						for(let index = tokenindex+1; index < fromindex; index++) 
						{
							columnarray.push(oldtextarray[index]);
						}
						let newcolarray = formatSelect(columnarray,tabcount);
						newcolarray.forEach(col => {newtextarray.push(col);});
						tokenindex = fromindex-1;
						tabcount--;
					}

					if (token === "FROM")
					{
						const fromEndClauses:string[] = ["WHERE", "GROUP", "ORDER"];
						tabcount++;
						//let whereindex:number = oldtextarray.map(token => token.toUpperCase()).indexOf("WHERE",tokenindex);
						let whereindex:number = oldtextarray.map(token => token.toUpperCase()).findIndex(x => fromEndClauses.includes(x), tokenindex+1);
						if (whereindex === -1)
						{
							whereindex = oldtextarray.length;
						}
						let columnarray:string[] = [];
						for(let index = tokenindex+1; index < whereindex; index++) 
						{
							columnarray.push(oldtextarray[index]);
						}
						let newcolarray = formatFrom(columnarray,tabcount);
						newcolarray.forEach(col => {newtextarray.push(col);});
						tokenindex = whereindex-1;
						tabcount--;
					}
				}
				tokenindex++;
			}

			editor.edit(editBuilder => {
				//editBuilder.replace(selection, reversed);
				editBuilder.replace(range, newtextarray.join("\n"));
			});
		}

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}


function formatSelect(colarray : string[], tabcount : number) : string[]
{
	let result:string[] = [];
	let tabs:string = tabchar.repeat(tabcount);

	colarray.forEach(token => {
		token = tabchar.repeat(tabcount) + token.trim();
		if (token.indexOf(",") > 0)
		{
			token = token.replaceAll(",","\n"+tabs+",");
		}
		result.push(token);
	});

	return result;
}

function formatFrom(colarray : string[], tabcount : number) : string[]
{
	let result:string[] = [];

	colarray.forEach(token => {
		token = tabchar.repeat(tabcount) + token;
		result.push(token);
	});

	return result;
}