import * as vscode from 'vscode';
import { Event } from 'vscode';
import { TodoProvider } from './todoProvider';
import { parseTodos } from './parser';

async function showInEditor(path: string, line: number) {
	const file = await vscode.workspace.openTextDocument(vscode.Uri.file(path));
	const editor = await vscode.window.showTextDocument(file, { preview: false });

	const position = new vscode.Position(line, 0);
	editor.selection = new vscode.Selection(position, position);

	const range = new vscode.Range(position, position);
	editor.revealRange(range);
}

export async function activate(context: vscode.ExtensionContext) {
	const folders = vscode.workspace.workspaceFolders;
	const rootPath = folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;

	const todos = await parseTodos(rootPath);
	context.subscriptions.push(vscode.window.registerTreeDataProvider('todos', new TodoProvider(todos, rootPath)));
	context.subscriptions.push(vscode.commands.registerCommand('todos.show', showInEditor));
}

export function deactivate() { }
