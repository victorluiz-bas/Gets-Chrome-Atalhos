function inicializarPopup() {
    const inputEquip = document.getElementById("textoEquip");
    const inputEquipNS = document.getElementById("textoEquipNS");
    const inputOS = document.getElementById("textoOS");
    const inputID = document.getElementById("textoID");
    const inputNS = document.getElementById("textoNS");


    const inputMP = document.getElementById("textoMP");
    const inputMP2 = document.getElementById("textoMP2");
    const btnMP = document.getElementById("pesquisarMP");
    const btnMP2 = document.getElementById("pesquisarMP2");


    const btnEquip = document.getElementById("pesquisarEquip");
    const btnEquipNS = document.getElementById("pesquisarEquipNS");
    const btnOS = document.getElementById("pesquisarOS");
    const btnID = document.getElementById("pesquisarID");
    const btnNS = document.getElementById("pesquisarNS");

    const status = document.getElementById("status");

    chrome.storage.local.get(["textoEquip", "textoOS", "textoID", "textoNS", "textoMP", "textoMP2", "textoEquipNS"], (data) => {
        if (data.textoEquip) inputEquip.value = data.textoEquip;
        if (data.textoOS) inputOS.value = data.textoOS;
        if (data.textoID) inputID.value = data.textoID;
        if (data.textoNS) inputNS.value = data.textoNS;
        if (data.textoMP) inputMP.value = data.textoMP;
        if (data.textoMP2) inputMP2.value = data.textoMP2;
        if (data.textoEquipNS) inputEquipNS.value = data.textoEquipNS;
    });



    const pesquisar = (input, key, url, seletor, camposParaLimpar = []) => {
        const texto = input.value;
        chrome.storage.local.set({
            [key]: texto
        });
        status.textContent = "Pesquisando...";
        redirecionarEExecutar(url, seletor, texto, camposParaLimpar, () => {
            status.textContent = "Pesquisa concluída.";
            setTimeout(() => status.textContent = "", 2000);
        });
    };




    btnEquip.addEventListener("click", () =>
        pesquisar(inputEquip, "textoEquip",
            "https://gets.ceb.unicamp.br/nec/view/equipamento/consulta.jsf?cad=true", "#fm1\\:tbEquipamentos\\:j_idt100\\:filter", ["#fm1\\:tbEquipamentos\\:j_idt103\\:filter"]
        )
    );



    btnEquipNS.addEventListener("click", () =>
        pesquisar(inputEquipNS, "textoEquipNS",
            "https://gets.ceb.unicamp.br/nec/view/equipamento/consulta.jsf?cad=true",
            "#fm1\\:tbEquipamentos\\:j_idt103\\:filter", ["#fm1\\:tbEquipamentos\\:j_idt100\\:filter"])
    );


    btnMP.addEventListener("click", () =>
        pesquisar(inputMP, "textoMP",
            "https://gets.ceb.unicamp.br/nec/view/agendamento/consulta.jsf",
            "#formAgendamentos\\:tbAgendamentos\\:cEquip\\:filter")
    );
    btnMP2.addEventListener("click", () =>
        pesquisar(inputMP2, "textoMP2",
            "https://gets.ceb.unicamp.br/nec/view/alarmes_agendamento/alarmes.jsf", ["#fm\\:tbAgendamentos\\:j_idt45\\:filter"])
    );
    // Mexendo aqui




    btnOS.addEventListener("click", () =>
        pesquisar(inputOS, "textoOS",
            "https://gets.ceb.unicamp.br/nec/view/consultas/consulta_os.jsf",
            "#fm1\\:consultaOsPendente\\:j_idt66\\:filter", ["#fm1\\:consultaOsPendente\\:j_idt69\\:filter", "#fm1\\:consultaOsPendente\\:j_idt71\\:filter"])
    );

    btnID.addEventListener("click", () =>
        pesquisar(inputID, "textoID",
            "https://gets.ceb.unicamp.br/nec/view/consultas/consulta_os.jsf",
            "#fm1\\:consultaOsPendente\\:j_idt69\\:filter", ["#fm1\\:consultaOsPendente\\:j_idt66\\:filter", "#fm1\\:consultaOsPendente\\:j_idt71\\:filter"])
    );

    btnNS.addEventListener("click", () =>
        pesquisar(inputNS, "textoNS",
            "https://gets.ceb.unicamp.br/nec/view/consultas/consulta_os.jsf",
            "#fm1\\:consultaOsPendente\\:j_idt71\\:filter", ["#fm1\\:consultaOsPendente\\:j_idt66\\:filter", "#fm1\\:consultaOsPendente\\:j_idt69\\:filter"])
    );


    [inputEquip, inputOS, inputID, inputNS, inputMP, inputMP2, inputEquipNS].forEach((input, index) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                [btnEquip, btnOS, btnID, btnNS, btnMP, btnMP2, btnEquipNS][index].click();
            }
        });
    });
}


document.addEventListener("DOMContentLoaded", inicializarPopup);



function redirecionarEExecutar(urlDestino, seletorCampo, texto, camposParaLimpar = [], callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        const executar = () => {
            preencherCampo(tab.id, seletorCampo, texto);
            camposParaLimpar.forEach(seletor => preencherCampo(tab.id, seletor, ""));
            if (callback) callback();
        };

        if (!tab.url.startsWith(urlDestino)) {
            chrome.tabs.update({ url: urlDestino });

            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === "complete") {
                    chrome.tabs.onUpdated.removeListener(listener);
                    setTimeout(executar, 2000);
                }
            });
        } else {
            executar();
        }
    });
}


function preencherCampo(tabId, seletorCampo, texto) {
    chrome.scripting.executeScript({
        target: { tabId },
        func: (seletorCampo, texto) => {
            const campo = document.querySelector(seletorCampo);
            if (campo) {
                campo.focus();
                campo.value = texto;

                campo.dispatchEvent(new Event("input", { bubbles: true }));
                campo.dispatchEvent(new Event("change", { bubbles: true }));

                setTimeout(() => {
                    campo.dispatchEvent(new Event("blur", { bubbles: true }));

                    const enviarTab = () => {
                        const tabDown = new KeyboardEvent("keydown", {
                            key: "Tab",
                            keyCode: 9,
                            which: 9,
                            bubbles: true
                        });
                        const tabUp = new KeyboardEvent("keyup", {
                            key: "Tab",
                            keyCode: 9,
                            which: 9,
                            bubbles: true
                        });
                        campo.dispatchEvent(tabDown);
                        campo.dispatchEvent(tabUp);
                    };

                    enviarTab();
                    setTimeout(enviarTab, 100);
                    setTimeout(enviarTab, 200);
                }, 500);
            }
        },
        args: [seletorCampo, texto]
    });
}