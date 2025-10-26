/**
 * @name AutoAcceptSpeaker
 * @author djdenicore
 * @author hps_bassline
 * @authorLink https://linktr.ee/djdenicore
 * @version 2.3.0
 * @description Automatically accept speaker invitations in voice channels
 * @website https://hpsbassline.myftp.biz/
 * @source https://github.com/DeniProtoshark/Discord-AutoAccept-Speaker/tree/better-discord
 */

module.exports = (() => {
    const config = {
        info: {
            name: "AutoAcceptSpeaker",
            authors: [
                { name: "djdenicore", discord_id: "743817824664944721" },
                { name: "hps_bassline", discord_id: "1428265096249086026" }
            ],
            version: "2.3.0",
            description: "Automatically accept speaker invitations in voice channels"
        }
    };

    return class AutoAcceptSpeaker {
        constructor() {
            this.config = config;
            this.observer = null;
            this.isEnabled = true;
            this.acceptCount = 0;

            this.exactButtonTexts = ["Accept", "Принять", "Aceptar", "Accepter", "Accepteren"];
        }

        getName() { return this.config.info.name; }
        getAuthor() { return this.config.info.authors.map(a => a.name).join(", "); }
        getVersion() { return this.config.info.version; }
        getDescription() { return this.config.info.description; }

        loadSettings() {
            return BdApi.Data.load(this.getName(), "settings") || {
                enabled: true,
                delay: 1000,
                showNotifications: true
            };
        }

        saveSettings() {
            BdApi.Data.save(this.getName(), "settings", this.settings);
        }

        start() {
            this.settings = this.loadSettings();
            this.isEnabled = this.settings.enabled;
            this.initializePlugin();
            this.log("Plugin started");
        }

        stop() {
            this.cleanup();
            this.log("Plugin stopped");
        }

        initializePlugin() {
            this.cleanup();
            this.observer = new MutationObserver(() => {
                if (this.isEnabled) {
                    this.checkForInvite();
                }
            });
            this.observer.observe(document.body, { childList: true, subtree: true });
        }

        checkForInvite() {
            try {
                const buttons = document.querySelectorAll('button, [role="button"]');
                for (const btn of buttons) {
                    const text = this.getButtonText(btn);
                    if (this.isExactMatch(text) && this.isVisible(btn) && !this.isButtonDisabled(btn)) {
                        this.clickButton(btn, text);
                        break;
                    }
                }
            } catch (e) {
                this.log("Error in checkForInvite:", e);
            }
        }

        getButtonText(button) {
            return (button.textContent || "").trim();
        }

        isExactMatch(text) {
            return this.exactButtonTexts.includes(text);
        }

        clickButton(button, text) {
            setTimeout(() => {
                if (this.isVisible(button) && !this.isButtonDisabled(button)) {
                    try {
                        button.click();
                        this.acceptCount++;
                        this.log(`✅ Accepted invitation - "${text}"`);
                        if (this.settings.showNotifications) {
                            this.showNotification(`Accepted - ${text}`);
                        }
                    } catch (e) {
                        this.log("Error clicking button:", e);
                    }
                }
            }, this.settings.delay);
        }

        isVisible(el) {
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            return !!(rect.width && rect.height && el.offsetParent !== null);
        }

        isButtonDisabled(btn) {
            return btn.disabled || btn.getAttribute('aria-disabled') === 'true' || btn.style.pointerEvents === 'none';
        }

        showNotification(msg) {
            try {
                BdApi.showToast(msg, { type: "info", timeout: 3000 });
            } catch {
                this.log(msg);
            }
        }

        cleanup() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
        }

        log(...args) {
            console.log("[AutoAcceptSpeaker]", ...args);
        }

        getSettingsPanel() {
            const panel = document.createElement("div");
            panel.style.cssText = `
                padding: 16px;
                color: #dcddde;
                background: #36393f;
                border-radius: 8px;
                font-family: 'gg sans', 'Noto Sans', Helvetica, sans-serif;
                font-size: 14px;
                line-height: 1.4;
            `;

            const status = this.isEnabled ? "🟢 ACTIVE" : "🔴 DISABLED";

            panel.innerHTML = `
                <style>
                    .aas-header {
                        margin-bottom: 20px;
                        padding-bottom: 16px;
                        border-bottom: 1px solid #4f545c;
                    }
                    
                    .aas-status {
                        background: #2f3136;
                        border-radius: 6px;
                        padding: 12px;
                        margin-bottom: 16px;
                        border-left: 4px solid ${this.isEnabled ? '#3ba55c' : '#ed4245'};
                    }
                    
                    .aas-setting-group {
                        background: #2f3136;
                        border-radius: 6px;
                        padding: 12px;
                        margin-bottom: 12px;
                        border: 1px solid #4f545c;
                    }
                    
                    .aas-setting-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 12px;
                    }
                    
                    .aas-setting-item:last-child {
                        margin-bottom: 0;
                    }
                    
                    .aas-slider-container {
                        width: 100%;
                    }
                    
                    .aas-slider {
                        width: 100%;
                        height: 6px;
                        border-radius: 3px;
                        background: #4f545c;
                        outline: none;
                        -webkit-appearance: none;
                        margin: 8px 0;
                    }
                    
                    .aas-slider::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: #3ba55c;
                        cursor: pointer;
                    }
                    
                    .aas-checkbox {
                        width: 20px;
                        height: 20px;
                        border-radius: 4px;
                        border: 2px solid #4f545c;
                        background: #36393f;
                        cursor: pointer;
                        position: relative;
                    }
                    
                    .aas-checkbox.checked {
                        background: #3ba55c;
                        border-color: #3ba55c;
                    }
                    
                    .aas-checkbox.checked::after {
                        content: "✓";
                        position: absolute;
                        color: white;
                        font-size: 12px;
                        font-weight: bold;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                    
                    .aas-button {
                        background: #3ba55c;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 500;
                        width: 100%;
                        margin-top: 8px;
                        transition: background 0.1s ease;
                    }
                    
                    .aas-button:hover {
                        background: #2d7d46;
                    }
                    
                    .aas-stats {
                        display: flex;
                        gap: 12px;
                        margin-top: 8px;
                    }
                    
                    .aas-stat {
                        flex: 1;
                        text-align: center;
                        padding: 8px;
                        background: #36393f;
                        border-radius: 4px;
                        font-size: 12px;
                    }
                    
                    .aas-stat-value {
                        font-weight: bold;
                        font-size: 16px;
                        color: #3ba55c;
                        margin-top: 4px;
                    }
                    
                    .aas-language-list {
                        font-size: 12px;
                        color: #b9bbbe;
                        margin-top: 8px;
                        line-height: 1.4;
                    }
                    
                    .aas-title {
                        font-weight: 600;
                        margin-bottom: 4px;
                    }
                    
                    .aas-description {
                        font-size: 12px;
                        color: #b9bbbe;
                    }
                </style>

                <div class="aas-header">
                    <div style="font-size: 18px; font-weight: 600; color: white;">AutoAcceptSpeaker</div>
                    <div style="font-size: 12px; color: #b9bbbe;">Automatically accept speaker invitations</div>
                </div>
                
                <div class="aas-status">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <div class="aas-title">Plugin Status</div>
                            <div style="color: ${this.isEnabled ? '#3ba55c' : '#ed4245'}; font-size: 12px;">
                                ${status}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 11px; color: #b9bbbe;">Accepted</div>
                            <div style="font-size: 20px; font-weight: bold; color: #3ba55c;">${this.acceptCount}</div>
                        </div>
                    </div>
                    
                    <div class="aas-stats">
                        <div class="aas-stat">
                            <div>Version</div>
                            <div class="aas-stat-value">v${this.config.info.version}</div>
                        </div>
                        <div class="aas-stat">
                            <div>Delay</div>
                            <div class="aas-stat-value">${this.settings.delay}ms</div>
                        </div>
                    </div>
                </div>
                
                <div class="aas-setting-group">
                    <div class="aas-setting-item">
                        <div>
                            <div class="aas-title">Enable Plugin</div>
                            <div class="aas-description">Toggle plugin functionality</div>
                        </div>
                        <div class="aas-checkbox ${this.settings.enabled ? 'checked' : ''}" id="enabledCheckbox"></div>
                    </div>
                </div>
                
                <div class="aas-setting-group">
                    <div style="margin-bottom: 8px;">
                        <div class="aas-title">Accept Delay</div>
                        <div class="aas-description">Delay before clicking accept button</div>
                    </div>
                    <div class="aas-slider-container">
                        <input type="range" class="aas-slider" id="delaySlider" min="0" max="5000" value="${this.settings.delay}" step="100">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #b9bbbe;">
                            <span>0ms</span>
                            <span id="delayValue">${this.settings.delay}ms</span>
                            <span>5000ms</span>
                        </div>
                    </div>
                </div>
                
                <div class="aas-setting-group">
                    <div class="aas-setting-item">
                        <div>
                            <div class="aas-title">Show Notifications</div>
                            <div class="aas-description">Show toast notifications</div>
                        </div>
                        <div class="aas-checkbox ${this.settings.showNotifications ? 'checked' : ''}" id="notificationsCheckbox"></div>
                    </div>
                </div>
                
                <div class="aas-setting-group">
                    <div class="aas-title">Supported Languages</div>
                    <div class="aas-language-list">
                        English: "Accept"<br>
                        Russian: "Принять"<br>
                        Spanish: "Aceptar"<br>
                        French: "Accepter"<br>
                        Dutch: "Accepteren"
                    </div>
                </div>
                
                <button class="aas-button" id="saveSettings">
                    Save Settings
                </button>
            `;

            // Event handlers
            panel.querySelector("#enabledCheckbox").addEventListener("click", e => {
                const checkbox = e.target;
                this.settings.enabled = !this.settings.enabled;
                this.isEnabled = this.settings.enabled;
                checkbox.classList.toggle("checked", this.settings.enabled);
            });

            panel.querySelector("#notificationsCheckbox").addEventListener("click", e => {
                const checkbox = e.target;
                this.settings.showNotifications = !this.settings.showNotifications;
                checkbox.classList.toggle("checked", this.settings.showNotifications);
            });

            const delaySlider = panel.querySelector("#delaySlider");
            const delayValue = panel.querySelector("#delayValue");
            delaySlider.addEventListener("input", e => {
                this.settings.delay = parseInt(e.target.value);
                delayValue.textContent = this.settings.delay + "ms";
            });

            panel.querySelector("#saveSettings").addEventListener("click", () => {
                this.saveSettings();
                this.showNotification("Settings saved");
            });

            return panel;
        }
    };
})();