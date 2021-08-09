/**
 * @name NitroSniper
 * @version 1.0.5
 * @description Automatically redeems Discord nitro gift codes. Donate some bitcoin if you wish `bc1q9wmggjd8st8erqfnyyt309ew3r9hwc3ss97mgj`
 * @authorId 230356924284010508
 * @source https://github.com/Xpl0itR/BetterDiscordPlugins
 */

const TokenRegex = new RegExp("(mfa\\.[\\w-]{84})|([\\w-]{24}\\.[\\w-]{6}\\.[\\w-]{27})");
let getChannel, getGuild;

if (global.BdApi) {
    getChannel = BdApi.findModuleByProps("getChannel").getChannel;
    getGuild   = BdApi.findModuleByProps("getGuild").getGuild;
}

function getToken() {
    let modules = window.webpackJsonp.push([[], { ["zl-webpackmodules"]: (module, exports, req) => module.exports = req}, [["zl-webpackmodules"]]]).c;
    for (let i in modules) if (modules[i].exports && modules[i].exports.getToken) return modules[i].exports.getToken();
}

class ManualNitroRedeemer {
    PaymentSourceId = null
    Headers         = {
        "Accept":        "*/*",
        "User-Agent":    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.56 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36",
        "Authorization": ""
    }
    
    async logIn(token) {
        this.Headers["Authorization"] = token;

        let response = await fetch("https://discord.com/api/v8/users/@me", {
            method:  "GET",
            headers: this.Headers
        });

        if (response.status === 200) {
            let responseBody = await response.json();
            console.log(`[NitroSniper] Logged in successfully as ${responseBody.username}#${responseBody.discriminator} [${responseBody.id}]`);
            
            return true;
        }

        return false;
    }

    async setPaymentSourceId() {
        let response = await fetch("https://discord.com/api/v8/users/@me/billing/payment-sources", {
            method:  "GET",
            headers: this.Headers,
        });

        if (response.status !== 200) {
            BdApi.alert(`[NitroSniper] Error`, `Could not find a valid payment source. Request returned ${response.status} - ${response.statusText}`);
            return false;
        }

        for (let paymentSource of await response.json()) {
            if (!paymentSource.invalid) {
                this.PaymentSourceId = paymentSource.id;
                return true;
            }
        }

        BdApi.alert(`[NitroSniper] Error`, `Could not find a valid payment source! Please make sure you have a valid payment source linked to your account.`);
        return false;
    }
    
    async redeemCode(code) {
        let checkResponse = await fetch(`https://discord.com/api/v8/entitlements/gift-codes/${code}`, {
            method:  "GET",
            headers: this.Headers,
        });

        if (checkResponse.status !== 200) {
            console.log("[NitroSniper] [DEBUG] code check failed", checkResponse);
            return false;
        }

        let checkResponseBody = await checkResponse.json();
        if (checkResponseBody.redeemed === true) {
            return false;
        }

        let redeemResponse = await fetch(`https://discord.com/api/v8/entitlements/gift-codes/${code}/redeem`, {
            method: "POST",
            headers: this.Headers,
            //body: {"channel_id": message.channel_id, "payment_source_id": this.PaymentSourceId }
        });
        
        if (redeemResponse.status !== 200) {
            console.log("[NitroSniper] [DEBUG] code redeem failed", redeemResponse);
            return false;
        }
        
        return redeemResponse.status == 200
    }
}

function createSwitch(onclick = null) {
    let switchElement        = document.createElement("div");
    switchElement.className  = "control-2BBjec da-control flexChild-faoVW3 da-flexChild";
    switchElement.style.flex = "1";

    let switchBackground           = document.createElement("div");
    switchBackground.className     = "container-3auIfb da-container";
    switchBackground.style.opacity = "1";
    switchElement.appendChild(switchBackground);

    let sliderSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    sliderSvg.setAttribute("class", "slider-TkfMQL da-slider");
    sliderSvg.setAttribute("viewBox", "0 0 28 20");
    sliderSvg.setAttribute("preserveAspectRatio", "xMinYMid meet");
    switchBackground.appendChild(sliderSvg);

    let sliderRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    sliderRect.setAttribute("fill", "white");
    sliderRect.setAttribute("x", "4");
    sliderRect.setAttribute("y", "0");
    sliderRect.setAttribute("height", "20");
    sliderRect.setAttribute("width", "20");
    sliderRect.setAttribute("rx", "10");
    sliderSvg.appendChild(sliderRect);

    let symbolSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    symbolSvg.setAttribute("viewBox", "0 0 20 20");
    symbolSvg.setAttribute("fill", "none");
    sliderSvg.appendChild(symbolSvg);

    let symbolPath1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    symbolSvg.appendChild(symbolPath1);

    let symbolPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    symbolPath2.setAttribute("fill", "rgba(114, 118, 125, 1)");
    symbolPath2.setAttribute("d", "M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z");
    symbolSvg.appendChild(symbolPath2);

    let checkbox       = document.createElement("input");
    checkbox.type      = "checkbox";
    checkbox.className = "input-rwLH4i da-input";
    switchBackground.appendChild(checkbox);

    function updateState() {
        if (checkbox.checked) {
            switchBackground.style.backgroundColor = "rgb(67, 181, 129)";
            sliderSvg.style.left = "12px";
            symbolPath1.setAttribute("fill", "rgba(67, 181, 129, 1)");
            symbolPath1.setAttribute("d", "M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z");
            symbolPath2.setAttribute("fill", "rgba(67, 181, 129, 1)");
            symbolPath2.setAttribute("d", "M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z");
        }
        else {
            switchBackground.style.backgroundColor = "rgb(114, 118, 125)";
            sliderSvg.style.left = "-3px";
            symbolPath1.setAttribute("fill", "rgba(114, 118, 125, 1)");
            symbolPath1.setAttribute("d", "M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z");
            symbolPath2.setAttribute("fill", "rgba(114, 118, 125, 1)");
            symbolPath2.setAttribute("d", "M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z");
        }
    }

    updateState();
    checkbox.onclick = () => {
        updateState();
        onclick?.(checkbox.checked);
    };

    switchElement.isEnabled  = function () { return checkbox.checked };
    switchElement.setEnabled = function (enabled) { checkbox.checked = enabled; };
    return switchElement;
}

module.exports = class NitroSniper {
    NitroRedeemer   = null
    UnpatchDispatch = null
    
    getName()        { return "NitroSniper"; }
    getVersion()     { return "1.0.5"; }
    getAuthor()      { return "Xpl0itR" }
    getDescription() { return "Automatically redeems Discord nitro gift codes. Donate some bitcoin if you wish `bc1q9wmggjd8st8erqfnyyt309ew3r9hwc3ss97mgj`"; }
    
    async start() {
        if (this.getData("overrideTokenEnabled") === true) {
            this.NitroRedeemer = new ManualNitroRedeemer();
            let success = overrideToken == null ? false : await this.NitroRedeemer.login(this.getData("overrideToken"));
            
            if (success) {
                BdApi.showToast(`${this.getName()} - Logged in Successfully!`, { type: "success" });
            }
            else {
                this.log("Failed to log in with override token! Exiting...", true, true)
                return;
            }

            /*success = await this.NitroRedeemer.setPaymentSourceId()
            if (!success) {
                this.log("Could not find a payment source ID! Exiting...", true, true)
                return;
            }*/
        }
        else {
            // TODO: Re-implement this to use discord internals
            this.NitroRedeemer = new ManualNitroRedeemer();
            let success = await this.NitroRedeemer.logIn(getToken());
            if (!success) {
                this.log("Failed to log in! Exiting...", true, true)
                return;
            }
        }

        this.UnpatchDispatch = BdApi.monkeyPatch(BdApi.findModuleByProps("dispatch"), "dispatch", { after: this.afterDispatch.bind(this) });
        this.log(`version ${this.getVersion()} has started.`, false, true);
    }

    stop() {
        this.UnpatchDispatch?.();
        this.log(`version ${this.getVersion()} has stopped.`, false, true);
    }

    log(message, error = false, showToast = false, showAlert = false) {
        console[error ? "error" : "log"](`%c[${this.getName()}] %c${message}`, "color: #3a71c1; font-weight: 700;", "");
        if (showToast) BdApi.showToast(`${this.getName()} - ${message}`, { type: (error ? "error" : "success") });
        if (showAlert) BdApi.alert(`${this.getName()} ${(error ? "Error" : "Success")}`, message);
    }

    getData(key) {
        return BdApi.getData(this.getName(), key);
    }

    setData(key, value) {
        BdApi.setData(this.getName(), key, value);
    }

    deleteData(key) {
        return BdApi.deleteData(this.getName(), key);
    }

    getSettingsPanel() {
        // Manual token label
        let manualTokenLabel       = document.createElement("h5");
        manualTokenLabel.className = "h5-18_1nd";
        manualTokenLabel.innerText = "Override token";

        // Manual token input
        let manualTokenInput       = document.createElement("input");
        manualTokenInput.className = "inputDefault-_djjkz input-cIJ7To";

        // Manual token switch
        let manualTokenSwitch = createSwitch(function (enabled) {
            manualTokenInput.disabled = !enabled;
        });
        manualTokenSwitch.style.marginLeft = "1em";

        // Manual token div
        let manualTokenDiv = document.createElement("div");
        manualTokenDiv.style.display = "flex";
        manualTokenDiv.style.alignItems = "center";
        manualTokenDiv.appendChild(manualTokenInput);
        manualTokenDiv.appendChild(manualTokenSwitch);

        // Save button
        let save = document.createElement("button");
        save.className = "button-38aScr colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN lookFilled-1Gx00P colorGreen-29iAKY";
        save.innerText = "Save";
        save.onclick   = () => {
            try {
                let overrideToken        = manualTokenInput.value;
                let overrideTokenValid   = overrideToken.match(TokenRegex) != null;
                let overrideTokenEnabled = manualTokenSwitch.isEnabled();

                this.setData("overrideTokenEnabled", overrideTokenEnabled && overrideTokenValid);

                if (overrideTokenValid) {
                    this.setData("overrideToken", overrideToken);
                }
                else if (overrideToken === "") {
                    this.deleteData("overrideToken");
                }

                if (overrideTokenEnabled && !overrideTokenValid) {
                    this.log("Failed to save settings - override token was invalid!", true, false, true)
                }
            }
            catch (e) {
                this.log(e, true, false, true)
                return;
            }

            // Show Toast
            this.log("Settings were saved!", false, true)

            // Restart
            this.load?.();
            this.stop?.();
            this.start?.();
        };

        // Settings panel
        let settingsPanel = document.createElement("div");
        settingsPanel.appendChild(manualTokenLabel);
        settingsPanel.appendChild(manualTokenDiv);
        settingsPanel.appendChild(save);

        // Set current values
        let overrideTokenEnabled = this.getData("overrideTokenEnabled") === true;
        manualTokenSwitch.setEnabled(overrideTokenEnabled);
        manualTokenInput.disabled = !overrideTokenEnabled;
        let overrideToken = this.getData("overrideToken");
        if (overrideToken != null) {
            manualTokenInput.value = overrideToken;
        }

        return settingsPanel;
    }

    afterDispatch(dispatched) {
        if (dispatched.methodArguments[0].type !== "MESSAGE_CREATE" && dispatched.methodArguments[0].type !== "MESSAGE_UPDATE")
            return;

        const message = dispatched.methodArguments[0].message;

        if (message.content == null)
            return;

        const giftUrlArray = message.content.match(/(https?:\/\/)?(www\.)?(discord(\.|\.com\/)gifts?)\/[^_\W]+/g);

        if (giftUrlArray == null)
            return;

        let messageContextString = `from \`${message.author.username}#${message.author.discriminator}\``
        let channel = getChannel(message.channel_id);
        if (channel.name != null && channel.name !== "")
            messageContextString += ` in \`#${channel.name}\``;
        if (message.guild_id != null)
            messageContextString += ` in server \`${getGuild(message.guild_id).name}\``;

        giftUrlArray.forEach(async (giftUrl) => {
            let code = giftUrl.replace(/(https?:\/\/)?(www\.)?(discord(\.|\.com\/)gifts?)\//g, "");
            let success = await this.NitroRedeemer.redeemCode(code);
            if (success) this.log(`Successfully redeemed nitro code \`${code}\` ${messageContextString}`, false, false, true);
            else this.log(`Failed to redeem nitro code: \`${code}\` ${messageContextString}`, true, false, true);
        });
    }
};
