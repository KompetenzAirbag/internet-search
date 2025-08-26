import { App, Modal } from 'obsidian';
import { SearchView } from './view';
import fetch from "node-fetch";
import InternetSearchPlugin from 'main';

export class SearchModal extends Modal {
    search_engine: string;
    prompt_result: HTMLDivElement;
    input: HTMLInputElement;
    plugin: InternetSearchPlugin;
    mode: string;
    wikipedia_search = "https://en.wikipedia.org/wiki/{{query}}";
    wikipedia_search_query_engine = "https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={{query}}&format=json";

    private latestRequestId = 0;

	constructor(app: App, plugin: InternetSearchPlugin, mode: string) {
		super(app);

        this.plugin = plugin;
        this.mode = mode;
	}

	onOpen() {
        this.modalEl.className = "prompt";
        this.modalEl.innerHTML = "";

        var input_container = document.createElement("div");
        input_container.className = "prompt-input-container";
        this.modalEl.appendChild(input_container);

        this.input = document.createElement("input");
        this.input.className = "prompt-input";
        this.input.autocapitalize = "off";
        this.input.spellcheck = false;
        this.input.type = "text";
        this.input.placeholder = "Search the web";

        this.input.onkeydown = async (event) => {
            await this.onkeyDown(event, this.input.value);
        }

        this.input.onkeyup = async (event) => {
            await this.onkeyUp(event, this.input.value);
        };

        input_container.appendChild(this.input);

        var clear_button = document.createElement("div");
        clear_button.className = "search-input-clear-button";
        clear_button.addEventListener("click", () => {
            this.input.value = "";
        });
        input_container.appendChild(clear_button);

        this.prompt_result = document.createElement("div");
        this.prompt_result.className = "prompt-results";
        this.modalEl.appendChild(this.prompt_result);
	}

    async onkeyDown(event: KeyboardEvent, query: string) {
        if (event.key === "Escape") {
            event.preventDefault();
            this.close();
        }
        else if (event.key === "Enter") {
            event.preventDefault();
            await this.onSubmit(event, query);
        }
    }

    async onkeyUp(event: KeyboardEvent, query: string) {
        this.latestRequestId++;
        const requestId = this.latestRequestId;

        if (event.key === "Escape" || event.key === "Enter") {
            event.preventDefault();
        }
        else if (event.key === "ArrowDown") {
            event.preventDefault();
            const selected = document.getElementsByClassName("is-selected")[0];
            if (selected) {
                const next = selected.nextElementSibling as HTMLDivElement;
                if (next) {
                    selected.classList.remove("is-selected");
                    next.classList.add("is-selected");
                }
            }
        }
        else if (event.key === "ArrowUp") {
            event.preventDefault();
            const selected = document.getElementsByClassName("is-selected")[0];
            if (selected) {
                const prev = selected.previousElementSibling as HTMLDivElement;
                if (prev) {
                    selected.classList.remove("is-selected");
                    prev.classList.add("is-selected");
                }
            }
        }
        else if (event.key === "Tab") {
            this.input.value = document.getElementsByClassName("is-selected")[0].innerHTML;
            await this.onSubmit(event, this.input.value);
        }
        else {
            this.prompt_result.innerHTML = "";

            const suggestions = this.mode === "web" ? await this.get_web_suggestions(query) : await this.get_wikipedia_suggestions(query);

            if (requestId !== this.latestRequestId) return;

            for (var i = 0; i < suggestions.length && i < 10; i++) {
                var sug = document.createElement("div");

                sug.className = "suggestion-item";
                sug.innerText = suggestions[i];
                
                if (i == 0) {
                    sug.className += " is-selected";
                }

                this.prompt_result.appendChild(sug);
            }
        }
    }

    async get_wikipedia_suggestions(query: string): Promise<Array<string>> {
        type Page = {
            pageid: number,
            ns: number,
            title: string,
            index: number
        }
        type WikipediaResponse = {
            query: {
                pages: {
                    [key: number]: Page;
                }
            }
        }

        const suggest_url = this.wikipedia_search_query_engine.replace("{{query}}", query);

        const resp = await fetch(suggest_url);
        const suggestions = await resp.json() as WikipediaResponse;

        return Object.values(suggestions.query.pages).map(page => page.title);
    }

    async get_web_suggestions(query: string): Promise<Array<string>> {
        type GoogleResponse = {
            0: string,
            1: Array<string>,
            2: Array<string>,
            3: Array<string>
        }

        const suggest_url = this.plugin.settings.search_engine_query_api.replace("{{query}}", query);

        const resp = await fetch(suggest_url);
        const suggestions: GoogleResponse = await resp.json() as GoogleResponse;

        return suggestions[1];
    }

    async onSubmit(event: KeyboardEvent, query: string) {
        const leaf = this.app.workspace.getLeaf("split");

        const url = this.mode === "web" ? this.plugin.settings.search_engine.replace("{{query}}", query) : this.wikipedia_search.replace("{{query}}", query);

        const view = new SearchView(leaf, url);
        await leaf.open(view);

        requestAnimationFrame(() => {
            this.app.workspace.setActiveLeaf(leaf);
        });

        this.close();
    }

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}