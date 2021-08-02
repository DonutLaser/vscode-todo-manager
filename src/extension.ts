import * as vscode from 'vscode';
import { TodoProvider } from './todoProvider';
import { parseTodos } from './parser';

export function activate(context: vscode.ExtensionContext) {
	const folders = vscode.workspace.workspaceFolders;
	const rootPath = folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;

	context.subscriptions.push(vscode.window.registerTreeDataProvider('todos', new TodoProvider([], rootPath)));
	context.subscriptions.push(vscode.commands.registerCommand('todos.open', () => { parseTodos(rootPath); }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
