import * as vscode from 'vscode';
import { parseFile } from './parser';

export class TodoProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | null | void> = new vscode.EventEmitter<CustomTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private root: CustomTreeItem[], private workspaceRoot?: string) {
        if (!workspaceRoot) { return; }

        const watcher = vscode.workspace.createFileSystemWatcher("**/*.*");
        watcher.onDidChange((filePath: vscode.Uri) => { this.updateTodos(filePath); });
        watcher.onDidCreate((filePath: vscode.Uri) => { this.updateTodos(filePath); });
        watcher.onDidDelete((filePath: vscode.Uri) => { this.removeTodos(filePath); });
    }

    getTreeItem(element: CustomTreeItem): vscode.TreeItem {
        const item = new vscode.TreeItem(
            element.label,
            element.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
        );

        if (element.line || element.line === 0) {
            item.description = `Line: ${element.line}`;
            item.command = element.command;
        }

        return item;
    }

    getChildren(element?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No TODO items in empty workspace');
            return Promise.resolve([]);
        }

        if (!element) { return Promise.resolve(this.root); }
        return Promise.resolve(element.children);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    private async updateTodos(filePath: vscode.Uri) {
        const file = filePath.fsPath;
        const result = await parseFile(file);
        const importantTodos = this.root[0]; // 0 is always important
        const regularTodos = this.root[1]; // 1 is always regular

        const label = file.replace(this.workspaceRoot + '\\', '');

        const ii = importantTodos.children.findIndex(t => t.label === label);
        if (ii !== -1) {
            importantTodos.children[ii].children = result.important;
            if (importantTodos.children[ii].children.length === 0) {
                importantTodos.children.splice(ii, 1);
            }
        } else if (result.important.length > 0) {
            importantTodos.children.push(new CustomTreeItem(label, result.important));
        }

        const ri = regularTodos.children.findIndex(t => t.label === label);
        if (ri !== -1) {
            regularTodos.children[ri].children = result.regular;
            if (regularTodos.children[ri].children.length === 0) {
                regularTodos.children.splice(ri, 1);
            }
        } else if (result.regular.length > 0) {
            regularTodos.children.push(new CustomTreeItem(label, result.regular));
        }

        this.refresh();
    }

    private removeTodos(filePath: vscode.Uri) {
        const file = filePath.fsPath;
        const label = file.replace(this.workspaceRoot + '\\', '');
        const importantTodos = this.root[0]; // 0 is always important
        const regularTodos = this.root[1]; // 1 is always regular

        const ii = importantTodos.children.findIndex(c => c.label === label);
        if (ii !== -1) {
            importantTodos.children.splice(ii, 1);
        }

        const ri = regularTodos.children.findIndex(c => c.label === label);
        if (ri !== -1) {
            regularTodos.children.splice(ri, 1);
        }

        this.refresh();
    }
}

export class CustomTreeItem {
    constructor(
        public label: string,
        public children: CustomTreeItem[],
        public line?: number,
        public command?: vscode.Command,
    ) {
    }
}