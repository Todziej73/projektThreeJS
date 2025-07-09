import { meshGroup } from "./main";

export const exportConfiguration = function () {
    const data = JSON.stringify(meshGroup.children, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'configuration.klg';
    a.click();

    URL.revokeObjectURL(url);
};

export const importConfiguration = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.klg';

    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                meshGroup.clear();

                data.forEach(obj => {
                    // import script
                });
            } catch (error) {
                console.error('Błąd przy imporcie konfiguracji:', error);
            }
        };
        reader.readAsText(file);
    };

    input.click();
};
