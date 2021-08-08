import * as vscode from 'vscode';
import { TodoProvider } from './todoProvider';
import { parseTodos } from './parser';

export async function activate(context: vscode.ExtensionContext) {
	const folders = vscode.workspace.workspaceFolders;
	const rootPath = folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;

	const todos = await parseTodos(rootPath);
	context.subscriptions.push(vscode.window.registerTreeDataProvider('todos', new TodoProvider(todos, rootPath)));
}

// this method is called when your extension is deactivated
export function deactivate() { }
