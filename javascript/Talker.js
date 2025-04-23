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

    constructor(instanceName = "DefaultTalker") {
        this.encryptedMessage = [];
        this.intermediateDeck = [];
        this.instanceName = instanceName;
        this.logs = [];
    }

    log(action, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            instance: this.instanceName,
            action: action,
            data: data
        };
        
        this.logs.push(logEntry);
        
        if (typeof window !== 'undefined' && window.localStorage) {
            const existingLogs = JSON.parse(localStorage.getItem('solitaire_logs') || '[]');
            existingLogs.push(logEntry);
            localStorage.setItem('solitaire_logs', JSON.stringify(existingLogs));
        }
        
        return logEntry;
    }
    
    getLogs() {
        return this.logs;
    }

    encryptMessage(msg) {
        this.encryptedMessage = [];
        this.intermediateDeck = [...this.initialDeck];
        
        this.log("START_ENCRYPTION", {
            originalMessage: msg.toUpperCase(),
            action: "encryption"
        });
        
        this.log("INIT_DECK", {
            deck: [...this.intermediateDeck]
        });

        [...msg.toUpperCase()].forEach((letter, index) => {
            this.log("PROCESS_LETTER", {
                letter: letter,
                position: index,
                remainingMessage: msg.toUpperCase().substring(index)
            });

            if (!this.dictionary.includes(letter)) {
                this.encryptedMessage.push(letter);
                this.log("NON_ALPHA_CHARACTER", {
                    letter: letter,
                    currentEncryptedMessage: this.encryptedMessage.join('')
                });
                return;
            }

            let keyStreamValue;
            let iteration = 0;
            while (keyStreamValue === undefined) {
                this.log("SHUFFLING_DECK", {
                    iteration: ++iteration,
                    forLetter: letter,
                    deckStateBefore: [...this.intermediateDeck]
                });

                this.drawDeck();

                this.log("DECK_SHUFFLED", {
                    iteration: iteration,
                    forLetter: letter,
                    deckStateAfter: [...this.intermediateDeck]
                });

                keyStreamValue = this.getKeyStreamValue();
                this.log("KEY_STREAM_VALUE", {
                    value: keyStreamValue,
                    valid: keyStreamValue !== undefined
                });
            }

            const letterIndex = this.dictionary.indexOf(letter);
            const encryptedIndex = (letterIndex + keyStreamValue) % 26;
            this.encryptedMessage.push(this.dictionary[encryptedIndex]);
            
            this.log("LETTER_ENCRYPTED", {
                original: letter,
                originalIndex: letterIndex,
                encrypted: this.dictionary[encryptedIndex],
                encryptedIndex: encryptedIndex,
                keyStreamValue: keyStreamValue,
                currentEncryptedMessage: this.encryptedMessage.join('')
            });
        });
        
        this.log("ENCRYPTION_COMPLETE", {
            originalMessage: msg.toUpperCase(),
            encryptedMessage: this.encryptedMessage.join('')
        });

        return this.encryptedMessage.join('');
    }

    decryptMessage(msg) {
        this.encryptedMessage = [];
        this.intermediateDeck = [...this.initialDeck];
        
        this.log("START_DECRYPTION", {
            encryptedMessage: msg.toUpperCase(),
            action: "decryption"
        });
        
        this.log("INIT_DECK", {
            deck: [...this.intermediateDeck]
        });

        [...msg.toUpperCase()].forEach((letter, index) => {
            this.log("PROCESS_LETTER", {
                letter: letter,
                position: index,
                remainingMessage: msg.toUpperCase().substring(index)
            });

            if (!this.dictionary.includes(letter)) {
                this.encryptedMessage.push(letter);
                this.log("NON_ALPHA_CHARACTER", {
                    letter: letter,
                    currentDecryptedMessage: this.encryptedMessage.join('')
                });
                return;
            }

            let keyStreamValue;
            let iteration = 0;
            while (keyStreamValue === undefined) {
                this.log("SHUFFLING_DECK", {
                    iteration: ++iteration,
                    forLetter: letter,
                    deckStateBefore: [...this.intermediateDeck]
                });

                this.drawDeck();

                this.log("DECK_SHUFFLED", {
                    iteration: iteration,
                    forLetter: letter,
                    deckStateAfter: [...this.intermediateDeck]
                });

                keyStreamValue = this.getKeyStreamValue();
                this.log("KEY_STREAM_VALUE", {
                    value: keyStreamValue,
                    valid: keyStreamValue !== undefined
                });
            }

            const letterIndex = this.dictionary.indexOf(letter);
            const originalIndex = (letterIndex - keyStreamValue + 26) % 26;
            this.encryptedMessage.push(this.dictionary[originalIndex]);
            
            this.log("LETTER_DECRYPTED", {
                encrypted: letter,
                encryptedIndex: letterIndex,
                original: this.dictionary[originalIndex],
                originalIndex: originalIndex,
                keyStreamValue: keyStreamValue,
                currentDecryptedMessage: this.encryptedMessage.join('')
            });
        });
        
        this.log("DECRYPTION_COMPLETE", {
            encryptedMessage: msg.toUpperCase(),
            decryptedMessage: this.encryptedMessage.join('')
        });

        return this.encryptedMessage.join('');
    }

    drawDeck() {
        let jokerBIndex = this.intermediateDeck.indexOf("JOKER_B");
        const oldJokerBPosition = jokerBIndex;
        
        if (jokerBIndex === this.intermediateDeck.length - 1) {
            this.intermediateDeck.splice(jokerBIndex, 1);
            this.intermediateDeck.splice(1, 0, "JOKER_B");
            jokerBIndex = 1;
        } else {
            this.swapCards(jokerBIndex, jokerBIndex + 1);
            jokerBIndex += 1;
        }
        
        this.log("STEP1_MOVE_JOKER_B", {
            jokerPosition: {
                before: oldJokerBPosition,
                after: jokerBIndex
            },
            deckAfter: [...this.intermediateDeck]
        });

        let jokerRIndex = this.intermediateDeck.indexOf("JOKER_R");
        const oldJokerRPosition = jokerRIndex;
        
        for (let i = 0; i < 2; i++) {
            if (jokerRIndex === this.intermediateDeck.length - 1) {
                this.intermediateDeck.splice(jokerRIndex, 1);
                this.intermediateDeck.splice(1, 0, "JOKER_R");
                jokerRIndex = 1;
            } else {
                this.swapCards(jokerRIndex, jokerRIndex + 1);
                jokerRIndex += 1;
            }
        }
        
        this.log("STEP2_MOVE_JOKER_R", {
            jokerPosition: {
                before: oldJokerRPosition,
                after: jokerRIndex
            },
            deckAfter: [...this.intermediateDeck]
        });

        const firstJokerIndex = Math.min(this.intermediateDeck.indexOf("JOKER_B"), this.intermediateDeck.indexOf("JOKER_R"));
        const secondJokerIndex = Math.max(this.intermediateDeck.indexOf("JOKER_B"), this.intermediateDeck.indexOf("JOKER_R"));

        const firstPart = this.intermediateDeck.slice(0, firstJokerIndex);
        const middlePart = this.intermediateDeck.slice(firstJokerIndex, secondJokerIndex + 1);
        const lastPart = this.intermediateDeck.slice(secondJokerIndex + 1);

        this.intermediateDeck = [...lastPart, ...middlePart, ...firstPart];
        
        this.log("STEP3_TRIPLE_CUT", {
            jokerPositions: {
                first: firstJokerIndex,
                second: secondJokerIndex
            },
            deckAfter: [...this.intermediateDeck]
        });

        const lastCard = this.intermediateDeck[this.intermediateDeck.length - 1];
        let cutValue;

        if (lastCard === "JOKER_B" || lastCard === "JOKER_R") {
            cutValue = 53;
        } else {
            cutValue = this.deckValue.indexOf(lastCard) + 1;
        }

        cutValue = Math.min(cutValue, this.intermediateDeck.length - 1);

        const topPart = this.intermediateDeck.slice(0, cutValue);
        const bottomPart = this.intermediateDeck.slice(cutValue, this.intermediateDeck.length - 1);
        const lastCardAgain = this.intermediateDeck[this.intermediateDeck.length - 1];

        this.intermediateDeck = [...bottomPart, ...topPart, lastCardAgain];
        
        this.log("STEP4_COUNT_CUT", {
            lastCard: lastCard,
            cutValue: cutValue,
            deckAfter: [...this.intermediateDeck]
        });
    }

    swapCards(index1, index2) {
        const temp = this.intermediateDeck[index1];
        this.intermediateDeck[index1] = this.intermediateDeck[index2];
        this.intermediateDeck[index2] = temp;
    }

    getKeyStreamValue() {
        const firstCard = this.intermediateDeck[0];
        let lookupValue;

        if (firstCard === "JOKER_B" || firstCard === "JOKER_R") {
            lookupValue = 53;
        } else {
            lookupValue = this.deckValue.indexOf(firstCard) + 1;
        }

        const outputCard = this.intermediateDeck[lookupValue];
        
        if (outputCard === "JOKER_B" || outputCard === "JOKER_R") {
            this.log("OUTPUT_CARD_IS_JOKER", {
                outputCard: outputCard,
                position: lookupValue,
                valid: false
            });
            return undefined;
        }

        const cardValue = this.deckValue.indexOf(outputCard) + 1;
        
        const keyStreamValue = ((cardValue - 1) % 26) + 1;
        
        this.log("KEY_STREAM_VALUE_CALCULATION", {
            outputCard: outputCard,
            position: lookupValue,
            cardValue: cardValue,
            keyStreamValue: keyStreamValue,
            valid: true
        });
        
        return keyStreamValue;
    }
}
