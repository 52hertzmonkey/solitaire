import Talker from "./Talker.js";

const alice = new Talker();
const bob = new Talker();

const initialMessage = "BONJOURCECIESTUNMESSAGE";
console.log("Message original:", initialMessage);

const encryptedMessage = alice.encryptMessage(initialMessage);
console.log("Message chiffré:", encryptedMessage);

const decryptedMessage = bob.decryptMessage(encryptedMessage);
console.log("Message déchiffré:", decryptedMessage);
