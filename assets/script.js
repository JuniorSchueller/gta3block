// Carregar blocos do arquivo JSON
fetch('assets/blocks.json')
.then(response => response.json())
.then(blocks => {
    const menuList = document.getElementById('menuList');
    blocks.forEach(block => {
        const listItem = document.createElement('li');
        listItem.textContent = block['friendly-name'];
        listItem.addEventListener('click', () => addItem(block));
        menuList.appendChild(listItem);
    });
});

// Adicionar item à lista
function addItem(block) {
    const codeList = document.getElementById('codeList');
    const item = document.createElement('div');
    item.classList.add('item');
    item.dataset.command = block['command'];
    item.dataset.argsCount = block.args ? block.args.length : 0; // Conta o número de argumentos
    item.innerHTML = `<strong>${block['friendly-name']}</strong>`;

    if (block.types) {
        const select = document.createElement('select');
        block.types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.type;
            option.textContent = type.description;
            select.appendChild(option);
        });
        item.appendChild(select);
    }

    if (block.args) {
        block.args.forEach(arg => {
            const input = document.createElement('input');
            input.type = arg.type === 'INT' ? 'number' : 'text';
            input.placeholder = arg.name;
            input.title = arg.description; // Adiciona a descrição como título
            item.appendChild(input);
        });
    }

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.classList.add('remove-btn');
    removeBtn.addEventListener('click', () => item.remove());
    item.appendChild(removeBtn);

    const moveUpBtn = document.createElement('button');
    moveUpBtn.textContent = '▲';
    moveUpBtn.classList.add('move-btn');
    moveUpBtn.addEventListener('click', () => moveUp(item));
    item.appendChild(moveUpBtn);

    const moveDownBtn = document.createElement('button');
    moveDownBtn.textContent = '▼';
    moveDownBtn.classList.add('move-btn');
    moveDownBtn.addEventListener('click', () => moveDown(item));
    item.appendChild(moveDownBtn);

    codeList.appendChild(item);
}

// Função para substituir marcadores de posição pelo valor dos argumentos
function replaceArguments(blockCode, args, selectedType) {
    let replacedCode = blockCode;
    args.forEach((arg, index) => {
        const regex = new RegExp(`\\{${index}\\}`, 'g'); // Escapando as chaves
        replacedCode = replacedCode.replace(regex, arg);
    });
    if (selectedType !== undefined) {
        replacedCode = replacedCode.replace('{type}', selectedType);
    }
    return replacedCode;
}


// Função para mover um bloco para cima
function moveUp(item) {
    if (item.previousElementSibling) {
        item.parentNode.insertBefore(item, item.previousElementSibling);
    }
}

// Função para mover um bloco para baixo
function moveDown(item) {
    if (item.nextElementSibling) {
        item.parentNode.insertBefore(item.nextElementSibling, item);
    }
}

// Exportar código montado
function exportCode() {
    const codeList = document.getElementById('codeList');
    const items = codeList.querySelectorAll('.item');
    let exportedCode = 'SCRIPT_START\n{\n    NOP\n\n';

    items.forEach(item => {
        let blockCode = item.dataset.command;
        const args = item.querySelectorAll('input');
        var type;
        if (item.querySelector('select')) {
            type = item.querySelector('select').value;
        }
        const argsValues = [];

        args.forEach(arg => {
            argsValues.push(arg.value.trim());
        });

        // Substitui os marcadores de posição pelos valores dos argumentos
        blockCode = replaceArguments(blockCode, argsValues, type);

        exportedCode += `    ${blockCode}\n`;
    });

    exportedCode += '}\nSCRIPT_END';

    // Criar arquivo de texto com o código exportado
    const blob = new Blob([exportedCode], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = 'script.sc';
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

// Abrir pré-visualização do código
function previewCode() {
    const codeList = document.getElementById('codeList');
    const items = codeList.querySelectorAll('.item');
    let previewContent = 'SCRIPT_START<br>{<br>&nbsp;&nbsp;&nbsp;&nbsp;NOP<br><br>';

    items.forEach(item => {
        let blockCode = item.dataset.command;
        const args = item.querySelectorAll('input');
        var type;
        if (item.querySelector('select')) {
            type = item.querySelector('select').value;
        }
        const argsValues = [];

        args.forEach(arg => {
            argsValues.push(arg.value.trim());
        });

        // Substitui os marcadores de posição pelos valores dos argumentos
        blockCode = replaceArguments(blockCode, argsValues, type);

        previewContent += `&nbsp;&nbsp;&nbsp;&nbsp;${blockCode}<br>`;
    });

    previewContent += '}<br>SCRIPT_END';

    const previewPopup = document.getElementById('previewPopup');
    const previewContentElement = document.getElementById('previewContent');
    previewContentElement.innerHTML = previewContent;
    previewPopup.style.display = 'block';
}


// Fechar pré-visualização do código
function closePreview() {
    const previewPopup = document.getElementById('previewPopup');
    previewPopup.style.display = 'none';
}
