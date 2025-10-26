/*
 * AutoAcceptSpeaker — Vencord plugin
 * Copyright (c) 2025 djdenicore, hps_bassline
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    autoAccept: {
        type: OptionType.BOOLEAN,
        description: "Automatically accept speaker invitations",
        default: true,
    },
    delay: {
        type: OptionType.NUMBER,
        description: "Delay before acceptance (ms)",
        default: 1000,
    },
    showNotifications: {
        type: OptionType.BOOLEAN,
        description: "Show acceptance notifications",
        default: true,
    }
});

export default definePlugin({
    name: "AutoAcceptSpeaker",
    description: "Automatically accept speaker invitations",
    authors: [
        { name: "djdenicore", id: 743817824664944721n },
        { name: "hps_bassline", id: 1428265096249086026n },
        Devs.You
    ],
    version: "1.2.4",
    settings,

    start() {
        this.log(`AutoAcceptSpeaker v${this.version} started`);
        if (settings.store.showNotifications) {
            this.showNotification(`AutoAcceptSpeaker v${this.version} restarted`);
        }

        this.observer = new MutationObserver(() => this.checkForSpeakerInvite());
        this.observer.observe(document.body, { childList: true, subtree: true });

        this.interval = setInterval(() => this.checkForSpeakerInvite(), 2000);
    },

    stop() {
        this.observer?.disconnect();
        clearInterval(this.interval);
        this.log(`AutoAcceptSpeaker v${this.version} stopped`);
        if (settings.store.showNotifications) {
            this.showNotification(`AutoAcceptSpeaker v${this.version} stopped`);
        }
    },

    checkForSpeakerInvite() {
        if (!settings.store.autoAccept) return;

        const inviteSelectors = [
            '[class*="inviteModal"]',
            '[aria-label*="приглашение" i]',
            '[aria-label*="invite" i]',
            '[class*="speakerInvite"]',
            '[class*="layerContainer"] [role="dialog"]'
        ];

        for (const selector of inviteSelectors) {
            const modal = document.querySelector(selector);
            if (modal) {
                this.acceptInvitation(modal);
                return;
            }
        }

        this.findAndClickAcceptButton();
    },

    findAndClickAcceptButton() {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
        const ACCEPT_TEXTS = [
            "Принять",   // Russian
            "Accept",    // English
            "Aceptar",   // Spanish
            "Accepter",  // French
            "Accepteren" // Dutch
        ];

        const acceptButton = buttons.find(btn => {
            const text = btn.textContent?.trim() || "";
            return ACCEPT_TEXTS.some(t => t.toLowerCase() === text.toLowerCase());
        });

        if (acceptButton && acceptButton.offsetParent !== null) {
            setTimeout(() => {
                acceptButton.click();
                this.log(`v${this.version}: Invitation accepted automatically`);
                if (settings.store.showNotifications) {
                    this.showNotification(`AutoAcceptSpeaker v${this.version}: Invitation accepted`);
                }
            }, settings.store.delay);
        }
    },

    acceptInvitation(modal) {
        const buttons = Array.from(modal.querySelectorAll('button, [role="button"]'));
        const ACCEPT_TEXTS = [
            "Принять", "Accept", "Aceptar", "Accepter", "Accepteren"
        ];

        const acceptBtn = buttons.find(btn => {
            const text = btn.textContent?.trim() || "";
            return ACCEPT_TEXTS.some(t => t.toLowerCase() === text.toLowerCase());
        });

        if (acceptBtn && acceptBtn.offsetParent !== null) {
            setTimeout(() => {
                acceptBtn.click();
                this.log(`v${this.version}: Invitation accepted via modal`);
                if (settings.store.showNotifications) {
                    this.showNotification(`AutoAcceptSpeaker v${this.version}: Invitation accepted`);
                }
            }, settings.store.delay);
        }
    },

    showNotification(message) {
        try {
            const ToastAPI = Vencord.Webpack.getByProps("showToast", "toastMessage");
            if (ToastAPI?.showToast) {
                ToastAPI.showToast({
                    message,
                    id: "auto-accept-speaker-notification",
                    type: 0 // INFO
                });
                return;
            }
        } catch {}
        this.log(message);
    },

    log(...args) {
        console.log(`[AutoAcceptSpeaker v${this.version}]`, ...args);
    }
});
