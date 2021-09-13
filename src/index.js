const Terminal = require("./Terminal");


const main = () => {
    const terminalElement = document.getElementById('terminal');
    
    const terminalInputField = document.createElement('div')
    terminalInputField.tabIndex = 1;
    terminalInputField.className = 'input';
    terminalInputField.contentEditable = true;
    // <span></span><div></div>

    let terminal = null;
    let terminalRows = [];

    terminalElement.addEventListener('focus', e => {
        terminalInputField.focus();
    });

    terminalInputField.addEventListener('keydown', e => {
        if (e.defaultPrevented) {
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            createNewRow();
        }

    }, true);

    const createNewRowElement = ({ setPrevText = false, last = false, text = '' }) => {
        const div = document.createElement('div');
        const span = document.createElement('span');

        if (setPrevText) {
            const terminalInputFieldText = terminalInputField.textContent;

            if (terminalRows.length !== 0) {
                const lastRow = terminalRows[terminalRows.length - 1];
                lastRow.querySelector('span').textContent += terminalInputFieldText;
            }

            terminalInputField.textContent = "";
        }
        
        div.append(span);

        if (last) {
            span.textContent = text + " ";

            div.classList.add('last');
            div.append(terminalInputField);
        } else {
            span.textContent = text;
        }

        return div;
    }

    const runTerminal = () => {
        terminal = new Terminal();
        createNewRow();
    }

    const addTerminalRow = (rowElement) => {
        terminalRows.push(rowElement);
        terminalElement.append(rowElement);
        terminalInputField.focus();
    }

    const createNewRow = () => {
        if (terminalRows.length !== 0) {
            const lastRow = terminalRows[terminalRows.length - 1];
            lastRow.classList.remove('last');
        }

        const commandString = terminalInputField.textContent.trim();
        const [startText, answerString] = terminal.executeCommand(commandString);

        if (!commandString) {
            addTerminalRow(createNewRowElement({ 
                setPrevText: true, 
                last: true, 
                text: startText || ""
            }));
            return;
        }

        const answerStringRows = answerString.split("\n");
        answerStringRows.forEach((answer, index) => {
            if (index === 0) {
                addTerminalRow(createNewRowElement({ setPrevText: true, text: answer }));
            } else {
                addTerminalRow(createNewRowElement({ text: answer }));
            }
        });

        addTerminalRow(createNewRowElement({ last: true, text: startText || "" }));
    }

    runTerminal();
}

const windowLoadHandler = () => {
    main();
}


module.exports.windowLoadHandler = windowLoadHandler;