import * as vscode from 'vscode';
import * as path from 'path';
import { Todo } from './todoProvider';

const IGNORE_FOLDERS = ['.git', '.vscode', 'node_modules'];

async function getAllFilesInWorkspace(workspace: string): Promise<string[]> {
    const result: string[] = [];

    const directories: vscode.Uri[] = [vscode.Uri.file(workspace)];

    while (directories.length > 0) {
        console.log('Searching directory:', directories[0].fsPath);

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

async function parseFile(filepath: string): Promise<Todo[]> {
    const file = await vscode.workspace.fs.readFile(vscode.Uri.file(filepath));

    // @NEXT: implement this

    return [];
}

export async function parseTodos(workspaceRoot?: string): Promise<Todo[]> {
    if (!workspaceRoot) { return []; }

    const files = await getAllFilesInWorkspace(workspaceRoot);
    const result = await Promise.all(files.map(f => parseFile(f)));

    return [];
}