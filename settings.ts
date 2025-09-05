import { App, PluginSettingTab, Setting } from 'obsidian';
import InternetSearchPlugin from './main';

export class SettingTab extends PluginSettingTab {
	plugin: InternetSearchPlugin;

	constructor(app: App, plugin: InternetSearchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Search engine')
			.addText(text => text
				.setPlaceholder('Enter your search engine')
				.setValue(this.plugin.settings.search_engine)
				.onChange(async (value) => {
					this.plugin.settings.search_engine = value;
					await this.plugin.saveSettings();
				}));
	}
}
