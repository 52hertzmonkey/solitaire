import Talker from './Talker.js';

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const encryptBtn = document.getElementById('encrypt-btn');
    const decryptBtn = document.getElementById('decrypt-btn');
    const resultDisplay = document.getElementById('result-display');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const resetBtn = document.getElementById('reset-btn');
    const stepInfo = document.getElementById('step-info');
    const letterProgress = document.getElementById('letter-progress');
    const deckDisplay = document.getElementById('deck-display');
    const currentStepEl = document.getElementById('current-step');
    const totalStepsEl = document.getElementById('total-steps');
    const actorIndicator = document.getElementById('actor-indicator');

    // Variables pour stocker les logs et l'état de la visualisation
    let logs = [];
    let currentStep = 0;
    let processingMode = ''; // 'encrypt' ou 'decrypt'
    let intermediateMessage = ''; // Message intermédiaire après chiffrement par Alice

    // Fonction pour activer/désactiver les boutons de navigation
    function updateNavButtons() {
        prevBtn.disabled = currentStep <= 0;
        nextBtn.disabled = currentStep >= logs.length - 1;
        resetBtn.disabled = logs.length === 0;
        
        currentStepEl.textContent = currentStep;
        totalStepsEl.textContent = logs.length - 1;
    }

    // Fonction pour mettre à jour l'indicateur d'acteur
    function updateActorIndicator(actor) {
        if (actor === 'Alice') {
            actorIndicator.className = 'actor-indicator alice-indicator';
            actorIndicator.textContent = 'Alice (Chiffrement)';
        } else if (actor === 'Bob') {
            actorIndicator.className = 'actor-indicator bob-indicator';
            actorIndicator.textContent = 'Bob (Déchiffrement)';
        } else {
            actorIndicator.className = 'actor-indicator';
            actorIndicator.textContent = '';
        }
    }

    // Fonction pour dessiner une carte
    function renderCard(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        if (card === 'JOKER_B') {
            cardElement.className += ' joker-b';
            cardElement.textContent = 'JB';
        } else if (card === 'JOKER_R') {
            cardElement.className += ' joker-r';
            cardElement.textContent = 'JR';
        } else {
            cardElement.textContent = card;
        }
        
        return cardElement;
    }

    // Fonction pour afficher l'état du paquet
    function renderDeck(deck) {
        deckDisplay.innerHTML = '';
        if (!deck) return;
        
        deck.forEach(card => {
            deckDisplay.appendChild(renderCard(card));
        });
    }

    // Fonction pour afficher la progression des lettres
    function renderLetterProgress(message, currentIndex) {
        letterProgress.innerHTML = '';
        if (!message) return;
        
        [...message.toUpperCase()].forEach((letter, index) => {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            if (index === currentIndex) {
                letterBox.className += ' active-letter';
            }
            letterBox.textContent = letter;
            letterProgress.appendChild(letterBox);
        });
    }

    // Fonction pour formater le texte avec mise en évidence de l'acteur
    function formatActorText(text, actor) {
        return text.replace(
            new RegExp(`(${actor})`, 'g'), 
            `<span class="actor-${actor.toLowerCase()}">$1</span>`
        );
    }

    // Fonction pour afficher les détails de l'étape actuelle
    function renderStepInfo(log) {
        if (!log) {
            stepInfo.innerHTML = '<p>Aucune opération en cours. Veuillez chiffrer ou déchiffrer un message.</p>';
            return;
        }

        const actor = log.instance === 'Alice' ? 'Alice' : 'Bob';
        let html = `<h4>${formatActorText(log.action, actor)}</h4>`;
        
        // Affichage différent selon le type d'action
        switch (log.action) {
            case 'START_ENCRYPTION':
                html += formatActorText(`<p>Alice commence à chiffrer le message: "${log.data.originalMessage}"</p>`, 'Alice');
                renderLetterProgress(log.data.originalMessage, -1);
                break;
                
            case 'START_DECRYPTION':
                html += formatActorText(`<p>Bob commence à déchiffrer le message: "${log.data.encryptedMessage}"</p>`, 'Bob');
                renderLetterProgress(log.data.encryptedMessage, -1);
                break;
                
            case 'INIT_DECK':
                html += formatActorText(`<p>${actor} initialise le paquet de cartes</p>`, actor);
                renderDeck(log.data.deck);
                break;
                
            case 'PROCESS_LETTER':
                html += formatActorText(`<p>${actor} traite la lettre "${log.data.letter}" à la position ${log.data.position}</p>`, actor);
                renderLetterProgress(
                    processingMode === 'encrypt' 
                        ? messageInput.value.toUpperCase() 
                        : intermediateMessage || messageInput.value.toUpperCase(), 
                    log.data.position
                );
                break;
                
            case 'NON_ALPHA_CHARACTER':
                html += formatActorText(`<p>${actor} détecte un caractère non alphabétique "${log.data.letter}" - conservé tel quel</p>`, actor);
                if (processingMode === 'encrypt') {
                    html += `<p>Message en cours: "${log.data.currentEncryptedMessage}"</p>`;
                } else {
                    html += `<p>Message en cours: "${log.data.currentDecryptedMessage}"</p>`;
                }
                break;
                
            case 'SHUFFLING_DECK':
                html += formatActorText(`<p>${actor} mélange le paquet (itération ${log.data.iteration}) pour la lettre "${log.data.forLetter}"</p>`, actor);
                renderDeck(log.data.deckStateBefore);
                break;
                
            case 'DECK_SHUFFLED':
                html += formatActorText(`<p>${actor} a mélangé le paquet (itération ${log.data.iteration}) pour la lettre "${log.data.forLetter}"</p>`, actor);
                renderDeck(log.data.deckStateAfter);
                break;
                
            case 'STEP1_MOVE_JOKER_B':
                html += formatActorText(`<p>${actor} - Étape 1: Déplacement du Joker Noir d'une position vers le bas</p>`, actor);
                html += `<p>Position avant: ${log.data.jokerPosition.before}, Position après: ${log.data.jokerPosition.after}</p>`;
                renderDeck(log.data.deckAfter);
                break;
                
            case 'STEP2_MOVE_JOKER_R':
                html += formatActorText(`<p>${actor} - Étape 2: Déplacement du Joker Rouge de deux positions vers le bas</p>`, actor);
                html += `<p>Position avant: ${log.data.jokerPosition.before}, Position après: ${log.data.jokerPosition.after}</p>`;
                renderDeck(log.data.deckAfter);
                break;
                
            case 'STEP3_TRIPLE_CUT':
                html += formatActorText(`<p>${actor} - Étape 3: Triple coupe (parties swappées autour des Jokers)</p>`, actor);
                html += `<p>Positions des jokers: premier à ${log.data.jokerPositions.first}, second à ${log.data.jokerPositions.second}</p>`;
                renderDeck(log.data.deckAfter);
                break;
                
            case 'STEP4_COUNT_CUT':
                html += formatActorText(`<p>${actor} - Étape 4: Coupe selon la valeur de la dernière carte (${log.data.lastCard})</p>`, actor);
                html += `<p>Valeur de coupe: ${log.data.cutValue}</p>`;
                renderDeck(log.data.deckAfter);
                break;
                
            case 'KEY_STREAM_VALUE':
                html += formatActorText(`<p>${actor} - Valeur du flux de clé: ${log.data.value || 'Joker détecté - réitération nécessaire'}</p>`, actor);
                html += `<p>Valide: ${log.data.valid ? 'Oui' : 'Non'}</p>`;
                break;
                
            case 'KEY_STREAM_VALUE_CALCULATION':
                html += formatActorText(`<p>${actor} - Carte de sortie: ${log.data.outputCard} à la position ${log.data.position}</p>`, actor);
                html += `<p>Valeur de la carte: ${log.data.cardValue}</p>`;
                html += `<p>Valeur finale du flux de clé: ${log.data.keyStreamValue}</p>`;
                break;
                
            case 'LETTER_ENCRYPTED':
                html += formatActorText(`<p>Alice chiffre la lettre "${log.data.original}" (index ${log.data.originalIndex}) en "${log.data.encrypted}" (index ${log.data.encryptedIndex})</p>`, 'Alice');
                html += `<p>Valeur de clé: ${log.data.keyStreamValue}</p>`;
                html += `<p>Message en cours: "${log.data.currentEncryptedMessage}"</p>`;
                break;
                
            case 'LETTER_DECRYPTED':
                html += formatActorText(`<p>Bob déchiffre la lettre "${log.data.encrypted}" (index ${log.data.encryptedIndex}) en "${log.data.original}" (index ${log.data.originalIndex})</p>`, 'Bob');
                html += `<p>Valeur de clé: ${log.data.keyStreamValue}</p>`;
                html += `<p>Message en cours: "${log.data.currentDecryptedMessage}"</p>`;
                break;
                
            case 'ENCRYPTION_COMPLETE':
                html += formatActorText(`<p>Alice a terminé le chiffrement</p>`, 'Alice');
                html += `<p>Message original: "${log.data.originalMessage}"</p>`;
                html += `<p>Message chiffré: "${log.data.encryptedMessage}"</p>`;
                
                // Stocker le message intermédiaire pour Bob
                intermediateMessage = log.data.encryptedMessage;
                break;
                
            case 'DECRYPTION_COMPLETE':
                html += formatActorText(`<p>Bob a terminé le déchiffrement</p>`, 'Bob');
                html += `<p>Message chiffré: "${log.data.encryptedMessage}"</p>`;
                html += `<p>Message déchiffré: "${log.data.decryptedMessage}"</p>`;
                
                // Vérifier si le message déchiffré correspond au message original
                const originalMessage = messageInput.value.trim().toUpperCase();
                if (processingMode === 'both' && log.data.decryptedMessage === originalMessage) {
                    html += `<p class="success">✅ Le déchiffrement est correct! Le message déchiffré correspond au message original.</p>`;
                } else if (processingMode === 'both') {
                    html += `<p class="error">❌ Le déchiffrement a échoué. Le message déchiffré ne correspond pas au message original.</p>`;
                }
                break;
                
            default:
                html += `<pre>${JSON.stringify(log.data, null, 2)}</pre>`;
        }
        
        stepInfo.innerHTML = html;
    }

    // Événement pour le bouton "Chiffrer"
    encryptBtn.addEventListener('click', () => {
        const message = messageInput.value.trim().toUpperCase();
        
        if (!message) {
            alert('Veuillez entrer un message à chiffrer.');
            return;
        }
        
        // Réinitialiser localStorage
        localStorage.removeItem('solitaire_logs');
        
        processingMode = 'encrypt';
        updateActorIndicator('Alice');
        
        const alice = new Talker("Alice");
        const encryptedMessage = alice.encryptMessage(message);
        
        resultDisplay.textContent = `Message chiffré par Alice: ${encryptedMessage}`;
        
        // Mettre à jour le message intermédiaire
        intermediateMessage = encryptedMessage;
        
        // Récupérer les logs
        logs = alice.getLogs();
        currentStep = 0;
        
        if (logs.length > 0) {
            renderStepInfo(logs[0]);
        }
        
        updateNavButtons();
    });

    // Événement pour le bouton "Déchiffrer"
    decryptBtn.addEventListener('click', () => {
        let message = messageInput.value.trim().toUpperCase();
        
        if (!message) {
            // Si aucun message n'est saisi mais qu'il y a un message intermédiaire, utiliser ce dernier
            if (intermediateMessage) {
                message = intermediateMessage;
            } else {
                alert('Veuillez entrer un message à déchiffrer ou chiffrer un message d\'abord.');
                return;
            }
        }
        
        // Réinitialiser localStorage
        localStorage.removeItem('solitaire_logs');
        
        processingMode = 'decrypt';
        updateActorIndicator('Bob');
        
        const bob = new Talker("Bob");
        const decryptedMessage = bob.decryptMessage(message);
        
        resultDisplay.textContent = `Message déchiffré par Bob: ${decryptedMessage}`;
        
        // Récupérer les logs
        logs = bob.getLogs();
        currentStep = 0;
        
        if (logs.length > 0) {
            renderStepInfo(logs[0]);
        }
        
        updateNavButtons();
    });

    // Événement pour le bouton "Précédent"
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            renderStepInfo(logs[currentStep]);
            updateNavButtons();
        }
    });

    // Événement pour le bouton "Suivant"
    nextBtn.addEventListener('click', () => {
        if (currentStep < logs.length - 1) {
            currentStep++;
            renderStepInfo(logs[currentStep]);
            updateNavButtons();
        }
    });

    // Événement pour le bouton "Réinitialiser"
    resetBtn.addEventListener('click', () => {
        currentStep = 0;
        renderStepInfo(logs[0]);
        updateNavButtons();
    });

    // Vérifier s'il y a des logs stockés dans localStorage au démarrage
    try {
        const storedLogs = localStorage.getItem('solitaire_logs');
        if (storedLogs) {
            logs = JSON.parse(storedLogs);
            if (logs.length > 0) {
                currentStep = 0;
                renderStepInfo(logs[0]);
                updateNavButtons();
                
                // Déterminer l'acteur basé sur les logs existants
                const actor = logs[0].instance;
                updateActorIndicator(actor);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
    }
});
