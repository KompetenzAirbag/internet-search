import { Notice, Plugin } from 'obsidian';
import { SearchModal } from './modal';
import { SettingTab } from './settings';

interface Settings {
	search_engine: string;
    search_engine_query_api: string;
}

const DEFAULT_SETTINGS: Settings = {
	search_engine: 'https://www.google.com/search?q={{query}}',
    search_engine_query_api: "https://suggestqueries.google.com/complete/search?client=firefox&q={{query}}"
}

export default class InternetSearchPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-web-search',
			name: 'Open Web Search',
			callback: () => {
                new SearchModal(this.app, this, "web").open();
			}
		});

        this.addCommand({
			id: 'open-wikipedia-search',
			name: 'Open Wikipedia Search',
			callback: () => {
                new SearchModal(this.app, this, "wikipedia").open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

