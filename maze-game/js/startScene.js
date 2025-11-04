export class startScene extends Phaser.Scene
{
    constructor(){
        super({
            key: 'startScene'
        })

        this.map;
        this.water;
    }
    
    preload()
    {
        this.load.tilemapTiledJSON('map', './maze-game/assets/maze-7x7.json');
        // load all imgs that we need
        this.load.image('mapPack_spritesheet', './maze-game/assets/map-v4/Spritesheet/mapPack_spritesheet.png');
        this.load.image('home', './maze-game/assets/maze1.png');
    }

    create()
    {
        // create map and add tileset
        this.map = this.make.tilemap({ key: 'map' });
        var mapPack = this.map.addTilesetImage("mapPack_spritesheet", "mapPack_spritesheet");
        this.water = this.map.createLayer('water', [mapPack]);

        const { width, height } = this.sys.game.config;
        this.add.image(width/2, height/2, 'home').setScale(2);

        var dialog = this.rexUI.add.dialog({
            x: width/2,
            y: height*0.82,

            actions: [
                createLabel(this, 'Enter Game', () =>{
                    this.nextScene();
                })
            ],

            space: {
                action: 15,
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },

            align: {
                actions: 'center', // 'center'|'left'|'right'
            },

        })
            .layout()
            .popUp(1000);

    }

    update() { }

    nextScene() {
        this.scene.start('instructScene');
    }

}

var createLabel = function (scene, text, callback) {
    return scene.rexUI.add.label({

        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 50, 0xF7F7F7),

        text: scene.add.text(0, 0, text, {
            fontSize: 60,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
            color: 0x595959
        }),

        space: {
            left: 30,
            right: 30,
            top: 25,
            bottom: 25
        }
    }).setInteractive().on('pointerdown', callback);;
}

