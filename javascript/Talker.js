//Clover Diamon Heart Spade

// Talker.js
export default class Talker {
    deckValue = [
        "AC", "2C", "3C", "4C", "5C", "6C",
        "7C", "8C", "9C", "10C", "JC", "QC",
        "KC", "AD", "2D", "3D", "4D", "5D",
        "6D", "7D", "8D", "9D", "10D", "JD",
        "QD", "KD", "AH", "2H", "3H", "4H", "5H",
        "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH",
        "AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S",
        "9S", "10S", "JS", "QS", "KS"
    ];

    initialDeck = [
        "AC", "2C", "3C", "4C", "5C", "6C", "JOKER_B", "7C", "8C", "9C", "10C", "JC", "QC",
        "KC", "AD", "2D", "3D", "4D", "5D",
        "6D", "7D", "8D", "9D", "10D", "JD",
        "QD", "KD", "AH", "2H", "3H", "4H", "5H", "JOKER_R", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH",
        "AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S",
        "9S", "10S", "JS", "QS", "KS"
    ];

    dictionary = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    constructor() {
        this.encryptedMessage = [];
        this.intermediateDeck = [];
    }

    encryptMessage(msg) {
        this.encryptedMessage = [];
        this.intermediateDeck = [...this.initialDeck]; // Initialiser le deck une seule fois

        [...msg.toUpperCase()].forEach(letter => {
            if (!this.dictionary.includes(letter)) {
                this.encryptedMessage.push(letter); // Caractères non alphabétiques inchangés
                return;
            }

            let keyStreamValue;
            while (keyStreamValue === undefined) {
                this.drawDeck();
                keyStreamValue = this.getKeyStreamValue();
            }

            // Chiffrer la lettre (addition modulo 26)
            const letterIndex = this.dictionary.indexOf(letter);
            const encryptedIndex = (letterIndex + keyStreamValue) % 26;
            this.encryptedMessage.push(this.dictionary[encryptedIndex]);
        });

        return this.encryptedMessage.join('');
    }

    decryptMessage(msg) {
        this.encryptedMessage = [];
        this.intermediateDeck = [...this.initialDeck]; // Initialiser le deck une seule fois

        [...msg.toUpperCase()].forEach(letter => {
            if (!this.dictionary.includes(letter)) {
                this.encryptedMessage.push(letter); // Caractères non alphabétiques inchangés
                return;
            }

            let keyStreamValue;
            while (keyStreamValue === undefined) {
                this.drawDeck();
                keyStreamValue = this.getKeyStreamValue();
            }

            // Déchiffrer la lettre (soustraction modulo 26)
            const letterIndex = this.dictionary.indexOf(letter);
            const decryptedIndex = (letterIndex - keyStreamValue + 26) % 26;
            this.encryptedMessage.push(this.dictionary[decryptedIndex]);
        });

        return this.encryptedMessage.join('');
    }

    drawDeck() {
        // Étape 1: Déplacer le Joker Noir d'une position vers le bas
        const indexJokerB = this.intermediateDeck.indexOf("JOKER_B");
        const jokerB = this.intermediateDeck.splice(indexJokerB, 1)[0];

        if (indexJokerB === this.intermediateDeck.length) {
            // Si le joker était la dernière carte, le mettre après la première
            this.intermediateDeck.splice(1, 0, jokerB);
        } else {
            this.intermediateDeck.splice(indexJokerB + 1, 0, jokerB);
        }

        // Étape 2: Déplacer le Joker Rouge de deux positions vers le bas
        const indexJokerR = this.intermediateDeck.indexOf("JOKER_R");
        const jokerR = this.intermediateDeck.splice(indexJokerR, 1)[0];

        if (indexJokerR === this.intermediateDeck.length) {
            // Si le joker était la dernière carte, le mettre après la deuxième
            this.intermediateDeck.splice(2, 0, jokerR);
        } else if (indexJokerR === this.intermediateDeck.length - 1) {
            // Si le joker était l'avant-dernière carte, le mettre après la première
            this.intermediateDeck.splice(1, 0, jokerR);
        } else {
            this.intermediateDeck.splice(indexJokerR + 2, 0, jokerR);
        }

        // Étape 3: Couper en trois et permuter (Double Cut)
        let firstJokerIndex = this.intermediateDeck.indexOf("JOKER_B");
        let secondJokerIndex = this.intermediateDeck.indexOf("JOKER_R");

        if (firstJokerIndex > secondJokerIndex) {
            [firstJokerIndex, secondJokerIndex] = [secondJokerIndex, firstJokerIndex];
        }

        const firstPart = this.intermediateDeck.slice(0, firstJokerIndex);
        const middlePart = this.intermediateDeck.slice(firstJokerIndex, secondJokerIndex + 1);
        const lastPart = this.intermediateDeck.slice(secondJokerIndex + 1);

        this.intermediateDeck = [...lastPart, ...middlePart, ...firstPart];

        // Étape 4: Couper selon la valeur de la dernière carte
        const lastCard = this.intermediateDeck[this.intermediateDeck.length - 1];
        let cutValue;

        if (lastCard === "JOKER_B" || lastCard === "JOKER_R") {
            cutValue = 53;
        } else {
            cutValue = this.deckValue.indexOf(lastCard) + 1;
        }

        // Limite cutValue à la longueur du deck - 1 pour éviter de déplacer la dernière carte
        cutValue = Math.min(cutValue, this.intermediateDeck.length - 1);

        const topPart = this.intermediateDeck.slice(0, cutValue);
        const bottomPart = this.intermediateDeck.slice(cutValue, this.intermediateDeck.length - 1);
        const lastCardAgain = this.intermediateDeck[this.intermediateDeck.length - 1];

        this.intermediateDeck = [...bottomPart, ...topPart, lastCardAgain];
    }

    getKeyStreamValue() {
        // Regarder la première carte
        const firstCard = this.intermediateDeck[0];
        let lookupValue;

        if (firstCard === "JOKER_B" || firstCard === "JOKER_R") {
            lookupValue = 53;
        } else {
            lookupValue = this.deckValue.indexOf(firstCard) + 1;
        }

        // Obtenir la carte à la position indiquée par la valeur de la première carte
        const outputCard = this.intermediateDeck[lookupValue];

        // Si c'est un joker, on retourne undefined pour recommencer
        if (outputCard === "JOKER_B" || outputCard === "JOKER_R") {
            return undefined;
        }

        // Sinon, on convertit la carte en valeur numérique
        const cardValue = this.deckValue.indexOf(outputCard) + 1;
        
        // Convertir en nombre de 1 à 26 (modulo 26 + 1)
        return ((cardValue - 1) % 26) + 1;
    }
}
