class BKTree {
    constructor() {
        this.tree = null;
    }

    add(word) {
        if (this.tree === null) {
            this.tree = { word: word, children: {} };
        } else {
            this._add(this.tree, word);
        }
        this.displayTree();
    }

    _add(node, word) {
        const distance = this._levenshteinDistance(node.word, word);
        if (!node.children[distance]) {
            node.children[distance] = { word: word, children: {} };
        } else {
            this._add(node.children[distance], word);
        }
    }

    search(word, tolerance = 2) {
        if (this.tree === null) {
            return [];
        }
        return this._search(this.tree, word, tolerance);
    }

    _search(node, word, tolerance) {
        const distance = this._levenshteinDistance(node.word, word);
        const results = [];

        if (distance <= tolerance) {
            results.push({ word: node.word, distance: distance });
        }

        for (let d = Math.max(1, distance - tolerance); d <= distance + tolerance; d++) {
            if (node.children[d]) {
                results.push(...this._search(node.children[d], word, tolerance));
            }
        }

        return results.sort((a, b) => a.distance - b.distance);
    }

    _levenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1) // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    displayTree() {
        const treeContainer = document.getElementById('tree-container');
        treeContainer.innerHTML = ''; // Clear previous tree
        if (this.tree !== null) {
            const treeStructure = this._generateTreeHTML(this.tree);
            treeContainer.innerHTML = treeStructure;
        }
    }

    _generateTreeHTML(node) {
        let html = `<div class="tree-node">${node.word}`;
        if (Object.keys(node.children).length > 0) {
            html += '<ul>';
            for (const distance in node.children) {
                html += `<li>${distance}: ${this._generateTreeHTML(node.children[distance])}</li>`;
            }
            html += '</ul>';
        }
        html += '</div>';
        return html;
    }
}

const bkTree = new BKTree();
const wordsListElement = document.getElementById('words-list');
const searchResultElement = document.getElementById('search-result');

function addWord() {
    const wordInput = document.getElementById('new-word');
    const word = wordInput.value.trim();
    if (word) {
        bkTree.add(word);
        const listItem = document.createElement('li');
        listItem.textContent = word;
        wordsListElement.appendChild(listItem);
        wordInput.value = '';
    }
}

function searchWord() {
    const searchInput = document.getElementById('search-word');
    const searchWord = searchInput.value.trim();
    if (searchWord) {
        const results = bkTree.search(searchWord);
        if (results.length > 0) {
            searchResultElement.textContent = `Best match: ${results[0].word} (Distance: ${results[0].distance})`;
        } else {
            searchResultElement.textContent = 'No match found';
        }
    }
}
