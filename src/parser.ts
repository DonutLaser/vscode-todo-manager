import * as vscode from 'vscode';
import * as path from 'path';
import { TextDecoder } from 'util';
import { CustomTreeItem } from './todoProvider';

const IGNORE_FOLDERS = ['.git', '.vscode', 'node_modules']; // @TODO (!important) have setting for this
const SUPPORTED_FILES = ['.ts', '.js', '.go', '.svelte']; // @TODO (!important) have settings for the extension to set these to whatever you want

interface ParseResult {
    important: CustomTreeItem[];
    regular: CustomTreeItem[];
}

async function getAllFilesInWorkspace(workspace: string): Promise<string[]> {
    const result: string[] = [];

    const directories: vscode.Uri[] = [vscode.Uri.file(workspace)];

    while (directories.length > 0) {
        const files = await vscode.workspace.fs.readDirectory(directories[0]);
        for (const f of files) {
            if (f[1] === vscode.FileType.File && SUPPORTED_FILES.includes(path.extname(f[0]))) {
                result.push(path.join(directories[0].fsPath, f[0]));
            } else if (f[1] === vscode.FileType.Directory) {
                if (!IGNORE_FOLDERS.includes(f[0])) {
                    directories.push(vscode.Uri.file(path.join(directories[0].fsPath, f[0])));
                }
            }
        }

        directories.splice(0, 1);
    }

    return result;
}

async function parseFile(filepath: string): Promise<ParseResult> {
    const file = await vscode.workspace.fs.readFile(vscode.Uri.file(filepath));
    const str = new TextDecoder().decode(file);
    const lines = str.replace('\r', '').split('\n');

    const result: ParseResult = { important: [], regular: [] };

    for (const [index, line] of lines.entries()) {
        if (!line.includes('@TODO')) { continue; }

        if (line.includes('!important')) {
            const item = new CustomTreeItem(line.replace('// @TODO (!important)', '').trim(), [], `Line: ${index + 1}`);
            result.important.push(item);
        } else {
            const item = new CustomTreeItem(line.replace('// @TODO', '').trim(), [], `Line: ${index + 1}`);
            result.regular.push(item);
        }
    }

    return result;
}

export async function parseTodos(workspaceRoot?: string): Promise<CustomTreeItem[]> {
    if (!workspaceRoot) {
        return [
            new CustomTreeItem('@TODO (!important)', []),
            new CustomTreeItem('@TODO', []),
        ];
    }

    const files = await getAllFilesInWorkspace(workspaceRoot);
    const todos = await Promise.all(files.map(f => parseFile(f)));

    const important: CustomTreeItem = new CustomTreeItem('@TODO (\'important\')', []);
    const regular: CustomTreeItem = new CustomTreeItem('@TODO', []);

    for (const [index, file] of files.entries()) {
        if (todos[index].important.length > 0) {
            important.children.push(new CustomTreeItem(file.replace(workspaceRoot + '\\', ''), todos[index].important));
        }

        if (todos[index].regular.length > 0) {
            regular.children.push(new CustomTreeItem(file.replace(workspaceRoot + '\\', ''), todos[index].regular));
        }
    }

    return [important, regular];
}