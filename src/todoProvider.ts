import * as vscode from 'vscode';

export class TodoProvider implements vscode.TreeDataProvider<Todo> {
    constructor(todos: Todo[], private workspaceRoot?: string) { }

    getTreeItem(element: Todo): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Todo): Thenable<Todo[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No TODO items in empty workspace');
            return Promise.resolve([]);
        }

        if (!element) {
            return Promise.resolve([
                new Todo('@TODO (Important)', vscode.TreeItemCollapsibleState.Expanded, false),
                new Todo('@TODO', vscode.TreeItemCollapsibleState.Collapsed, false),
            ]);
        }

        if (element.isTodo) {
            return Promise.resolve([]);
        }

        return Promise.resolve([]);
    }
}

export class Todo extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public isTodo: boolean,
    ) {
        super(label, collapsibleState);
        this.description = 'some kind of todo monster';
    }
}