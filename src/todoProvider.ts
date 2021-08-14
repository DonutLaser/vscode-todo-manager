import * as vscode from 'vscode';

export class TodoProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    constructor(private root: CustomTreeItem[], private workspaceRoot?: string) { }

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