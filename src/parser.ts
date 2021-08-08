import * as vscode from 'vscode';
import * as path from 'path';
import { TextDecoder } from 'util';
import { CustomTreeItem } from './todoProvider';

const IGNORE_FOLDERS = ['.git', '.vscode', 'node_modules'];

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
            if (f[1] === vscode.FileType.File) {
                result.push(path.join(workspace, f[0]));
            } else if (f[1] === vscode.FileType.Directory) {
                if (!IGNORE_FOLDERS.includes(f[0])) {
                    directories.push(vscode.Uri.file(path.join(workspace, f[0])));
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

    for (const line of lines) {
        if (!line.includes('@TODO')) { continue; }

        if (line.includes('!important')) {
            result.important.push(new CustomTreeItem(line, []));
        } else {
            result.regular.push(new CustomTreeItem(line, []));
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