import {ItemView, WorkspaceLeaf} from 'obsidian';

export class SearchView extends ItemView {
    query: string;
    site: string;
    url: string;

    frame: HTMLElement;

    constructor(leaf: WorkspaceLeaf, url: string) {
      super(leaf);
      this.url = url;
    }

    async onOpen() {
        this.frame = document.createElement('iframe');
        this.frame.addClass(`soi-site`);
        this.frame.setAttr('style', 'height: 100%; width:100%');
        this.frame.setAttr('src', this.url);
        this.frame.setAttr('tabindex', '0');
        this.containerEl.children[1].appendChild(this.frame);
    }

    getDisplayText(): string {
      return `${this.site}: ${this.query}`;
    }

    getViewType(): string {
      return 'Search on Internet';
    }
}