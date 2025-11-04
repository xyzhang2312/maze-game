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
        var titleTxt = '  欢迎参加游戏！';
        var mainTxt = (
            // "在这个游戏中，你将在迷宫中\n"+
            // "探索并寻找宝物。\n\n"+
            // "在每轮游戏开始时，将会给你呈现迷\n"+
            // "宫的布局（5秒），接着迷宫消失，随\n"+
            // "即显示你的位置和宝物 [img=star] 的位置，你\n"+
            // "的任务是 [b]规划一条最短路径[/b] 去收集 [img=star]。"
            "在这个游戏中，你将在迷宫中\n"+
            "探索并寻找宝物。\n\n"+
            "在每轮游戏开始时，将会给你呈现迷\n"+
            "宫的布局（5秒），接着迷宫消失，随\n"+
            "即显示你的位置和星星的位置，你的\n"+
            "任务是规划一条最短路径去收集星星。"
        );
        var buttonTxt = '下一页';
        var pageNo = 1;
        new createInstrPanel(this, width, height, pageNo, titleTxt, mainTxt, buttonTxt)

        ///////////////////PAGE TWO////////////////////
        eventsCenter.once('page1complete', function () {
        mainTxt = (
            "接下来，让我们先来做5个小练习\n"+
            "来熟悉游戏规则。如果你准备\n"+
            "好了，请点击 开始游戏 按钮！"
        );
        pageNo = 2;
        var buttonTxt = '开始游戏';
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
            lineSpacing: 13, // 设置行间距
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
