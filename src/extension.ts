import * as vscode from 'vscode';
import * as formatSQLCode from './formatSQLCode';

export function activate(context: vscode.ExtensionContext)
{
	let disposable = vscode.commands.registerCommand('datastem-sql-formatter.formatsql', () => 
	{
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from DataStem SQL Formatter!');

		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		
		if (editor) 
		{
			
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

			const formattedSQL = formatSQLCode.formatSQLCode(text);
			
			editor.edit(editBuilder => {
				//editBuilder.replace(selection, reversed);
				//editBuilder.replace(range, destarray.join("\n"));
				editBuilder.replace(range,formattedSQL);
			});
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
