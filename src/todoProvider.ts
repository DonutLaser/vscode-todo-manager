import * as vscode from 'vscode';

export class TodoProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    constructor(private root: CustomTreeItem[], private workspaceRoot?: string) { }

    getTreeItem(element: CustomTreeItem): vscode.TreeItem {
        return new vscode.TreeItem(
            element.label,
            element.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
        );
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
    ) {
    }
}