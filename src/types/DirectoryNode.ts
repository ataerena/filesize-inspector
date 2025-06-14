export default class DirectoryNode {
    public parent: DirectoryNode | null;
    public children: DirectoryNode[];
    public info: FileInfo;

    constructor(_info: FileInfo, _parent: DirectoryNode | null) {
        this.parent = _parent;
        this.children = [];
        this.info = _info;
    }

    AddToChildren(node: DirectoryNode): void {
        this.children.push(node);
    }
}