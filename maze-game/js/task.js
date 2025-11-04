import { startScene } from "./startScene.js";
import { instructScene } from "./instructScene.js";
import { maze5x5 } from "./maze-5x5.js";
import { maze7x7 } from "./maze-7x7.js";

const config = {
    type: Phaser.AUTO,
    width: 1088,
    height: 2368,
    backgroundColor: '#A9A9A9',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene:[
            startScene,
            instructScene,
            maze5x5,
            maze7x7,
        ],
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: rexuiplugin,  // load the rexUI plugins here for all scenes
            mapping: 'rexUI'
        }],
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
};


const game = new Phaser.Game(config);

// if desired, block access to game on phones/tablets
const allowDevices = true;
if (allowDevices == false) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
       alert("Sorry, this game does not work on mobile devices!");
    }
}
