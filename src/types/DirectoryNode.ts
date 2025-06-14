export default class DirectoryNode {
    private parent: DirectoryNode | null;
    private children: DirectoryNode[];
    private stat: FileItem;

    constructor(_stat: FileItem, _parent: DirectoryNode | null) {
        this.parent = _parent;
        this.children = [];
        this.stat = _stat;
    }

    GetParent(): DirectoryNode | null {
        return this.parent;
    }

    GetChildren(): DirectoryNode[] {
        return this.children;
    }

    GetChildAt(index: number): DirectoryNode {
        return this.children[index];
    }

    GetStat(): FileItem {
        return this.stat;
    }

    AddToChildren(node: DirectoryNode): void {
        this.children.push(node);
    }
}