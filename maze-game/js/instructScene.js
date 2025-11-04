import eventsCenter from "../js/eventsCenter.js";
export class instructScene extends Phaser.Scene
{
    constructor(){

        super({
            key: 'instructScene'
        })

        this.map;
        this.water;

    }
    
    preload()
    {
        this.load.tilemapTiledJSON('map', './maze-game/assets/maze-7x7.json');
        // load all imgs that we need
        this.load.image('mapPack_spritesheet', './maze-game/assets/map-v4/Spritesheet/mapPack_spritesheet.png');
        this.load.image('star', './maze-game/assets/star.png');
    }

    create()
    {
        // create map and add tileset
        this.map = this.make.tilemap({ key: 'map' });
        var mapPack = this.map.addTilesetImage("mapPack_spritesheet", "mapPack_spritesheet");
        this.water = this.map.createLayer('water', [mapPack]);

        const { width, height } = this.sys.game.config;

        ///////////////////PAGE ONE////////////////////
        var titleTxt = ' Welcome to the game!';
        var mainTxt = (
            "In this game, you will explore \n"+
            "the maze and collect stars.\n\n"+
            "At each round, you will see the layout of\n"+
            "the maze (5 seconds), then it disapears.\n\n"+
            "You will have to take the shortest\n"+
            "path to collect the star. "
        );
        var buttonTxt = 'next page';
        var pageNo = 1;
        new createInstrPanel(this, width, height, pageNo, titleTxt, mainTxt, buttonTxt)

        ///////////////////PAGE TWO////////////////////
        eventsCenter.once('page1complete', function () {
        mainTxt = (
            "Before you start the real game, you\n"+
            "will have a chance to practice.\n\n"+
            "When you are ready, press start to begin!"
        );
        pageNo = 2;
        var buttonTxt = 'start practice';
        createInstrPanel(this, width, height, pageNo, titleTxt, mainTxt, buttonTxt)
        }, this);

        // end scene
        eventsCenter.once('page2complete', function () {
            this.nextScene();
            }, this);

    }
    nextScene() {
        this.scene.start('maze5x5');
    }
}



var createInstrPanel = function (scene, width, height, pageNo, titleTxt, mainTxt, buttonTxt) {
    
    var dialog = createDialog(scene, width, height, pageNo, titleTxt, mainTxt, buttonTxt);

    dialog
        .once('button.click', function (button, groupName, index) {
            dialog.scaleDownDestroy();                     // destroy panel components
            eventsCenter.emit('page'+pageNo+'complete');   // emit completion event
        }, scene)
        .on('button.over', function (button, groupName, index) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        .on('button.out', function (button, groupName, index) {
            button.getElement('background').setStrokeStyle();
        });
}

var createDialog = function (scene, width, height, pageNo, titleTxt, mainTxt, buttonTxt) {
    var dialog = scene.rexUI.add.dialog({
        x: width/2,
        y: height/2,

        background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0).setAlpha(0.5),

        title: scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f).setAlpha(0.5),
            text: scene.add.text(0, 0, titleTxt, {
                fontSize: 58,
                fontFamily: '"Microsoft YaHei", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
            }),
            space: {
                left: 15,
                right: 15,
                top: 10,
                bottom: 10
            },
            align: 'center',
        }),

        content: scene.add.text(0, 0, mainTxt,{
            fontSize: 48,
            // wordWrap: { width: 280 },
            fontFamily: '"Microsoft YaHei", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
            lineSpacing: 13,
            align: 'center',
            }
        ),

        actions: [
            createLabel(scene, buttonTxt)
        ],

        space: {
            title: 35,
            content: 30,
            action: 15,
            left: 30,
            right: 30,
            top: 15,
            bottom: 15,
        },

        align: {
            actions: 'center', // 'center'|'left'|'right'
        },

        expand: {
            content: false,
        }
    })
        .layout()
        .popUp(1000);
        return dialog
}

var createLabel = function (scene, text) {
    return scene.rexUI.add.label({

        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 40, 0xF7F7F7).setAlpha(0.9),

        text: scene.add.text(0, 0, text, {
            fontSize: 46,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
            color: 0x595959
        }),

        space: {
            left: 25,
            right: 25,
            top: 15,
            bottom: 15
        }
    });
}
