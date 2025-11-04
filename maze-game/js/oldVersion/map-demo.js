var bell
var coinText
var nCoins = 0;
var matrixCenters = [];
let coinCenter
let upButton
let downButton
let rightButton
let leftButton
let matrixX
let matrixY


class maze extends Phaser.Scene
{
    constructor(){

        super('examples')

        this.player;
        this.joystick;
        this.map;
        this.layer;
        this.coins;
        this.tweens
    }
    
    preload()
    {
        this.load.tilemapTiledJSON('map', './assets/tiles/maze-v3.json');

        // load all imgs that we need
        this.load.image('tile1', './assets/tiles/tile1.png');
        this.load.image('tile2', './assets/tiles/tile2.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('pointer', 'assets/pointer.png');
        this.load.image('vjoy_base', './assets/joystick/base.png');
        this.load.image('vjoy_body', './assets/joystick/body.png');
        this.load.image('vjoy_cap', './assets/joystick/cap.png');
        this.load.image('upButton', 'assets/control/upButton.png');
        this.load.image('downButton', './assets/control/downButton.png');
        this.load.image('leftButton', './assets/control/leftButton.png');
        this.load.image('rightButton', './assets/control/rightButton.png');

        // load joystick plugin
        this.load.scenePlugin('VJoyPlugin', './js/VJoyPlugin.js', 'VJoyPlugin', 'vjoy');

        // load background related to this game
        this.load.audio("bell", "assets/sound/ding.mp3");
    }

    initSounds(){
        this.sound.add('bell', { volume: 0.2 });
    }
    
    create()
    {
        // create map and add tileset
        this.map = this.make.tilemap({ key: 'map' });
        this.tile1 = this.map.addTilesetImage("tile1", "tile1");
        this.tile2 = this.map.addTilesetImage("tile2", "tile2");
        this.layer = this.map.createLayer('layer', [this.tile1, this.tile2]);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        
        // get all start point and add player randomly
        let tileWidth = 16;
        let tileHeight = 16;
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                let centerX = 96 + i * (6 * tileWidth) + 1.5 * tileWidth;
                let centerY = 96 + j * (6 * tileHeight) + 1.5 * tileHeight;
                matrixCenters.push({ x: centerX, y: centerY });
            }
        }


        // pick location of player and star
        let playerCenter;
        while (true) {
            playerCenter = Phaser.Math.RND.pick(matrixCenters);
            coinCenter = Phaser.Math.RND.pick(matrixCenters);
            let overlap = false;
            if (playerCenter.x === coinCenter.x && playerCenter.y === coinCenter.y) {
            overlap = true;
            }
            if (!overlap) {
                break;
            }
        }


        // add player and goal
        this.coins = this.add.image(coinCenter.x, coinCenter.y, 'star');
        this.coins.setDepth(2);
        this.tweens.add({
            targets: this.coins,
            angle: 90,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.player = this.add.sprite(playerCenter.x, playerCenter.y, 'player').setScale(1);
        this.pointer = this.add.sprite(0, 0, 'pointer').setScale(2);
        this.pointer.setOrigin(0.5, 1);
        this.pointer.setDepth(1);


        // add coin count text
        coinText = this.add.text(40, 40, "星星：" + nCoins, {
                fontSize: '22px',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
                fill: "#FFD700",
                padding: { x: 20, y: 10 },
                backgroundColor: "#000000"
            }).setOrigin(0);
        coinText.setDepth(1);


        // 创建控制按钮
        upButton = this.add.image(400, 780, 'upButton').setScale(1.2).setInteractive();
        downButton = this.add.image(400, 920, 'downButton').setScale(1.2).setInteractive();
        leftButton = this.add.image(330, 850, 'leftButton').setScale(1.2).setInteractive();
        rightButton = this.add.image(470, 850, 'rightButton').setScale(1.2).setInteractive();
        upButton.setOrigin(0); upButton.setDepth(1);
        downButton.setOrigin(0); downButton.setDepth(1);
        leftButton.setOrigin(0); leftButton.setDepth(1);
        rightButton.setOrigin(0); rightButton.setDepth(1);


        // 监听按钮点击事件
        var TILE_SIZE = 16;
        upButton.on('pointerdown', event => {
            const tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y - 32, true);
            if (tile && tile.index === 2){
                this.player.y -= 6 * TILE_SIZE;
            }
        });
        downButton.on('pointerdown', event => {
            const tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y + 32, true);
            if (tile && tile.index === 2){
                this.player.y += 6 * TILE_SIZE;
            }
        });
        leftButton.on('pointerdown', event => {
            const tile = this.layer.getTileAtWorldXY(this.player.x - 32, this.player.y, true);
            if (tile && tile.index === 2){
                this.player.x -= 6 * TILE_SIZE;
            }
        });
        rightButton.on('pointerdown', event => {
            const tile = this.layer.getTileAtWorldXY(this.player.x + 32, this.player.y, true);
            if (tile && tile.index === 2){
                this.player.x += 6 * TILE_SIZE;
            }
        });


        // add camera
        this.cam = this.cameras.main;
        this.cam.setZoom(1);
        this.cam.setBounds(0, 0, this.layer.width * this.layer.scaleX, this.layer.height * this.layer.scaleY);
        this.cam.scrollX = this.player.x - this.cam.width * 0.5;
        this.cam.scrollY = this.player.y - this.cam.height * 0.5;
        var gui = new dat.GUI();
        var f1 = gui.addFolder('游戏选项');
        this.stepOption = { nstep: 1 };
        f1.add(this.stepOption, 'nstep', 1, 4).name('路线数量').step(1).onChange(function(value) {
            console.log('玩家选择的路线数量：' + value);
        });
        var f2 = gui.addFolder('镜头');
        f2.add(this.cam, 'zoom', 1, 2).step(0.1);

    }

    
    
    update (time, delta)
    {
        // change the text location and do not change font size
        const viewport = this.cameras.main.worldView;
        const zoom = this.cameras.main.zoom;
        coinText.x = viewport.x + 20/zoom;
        coinText.y = viewport.y + 20/zoom;
        coinText.setScale(1/zoom);

        upButton.x = viewport.x + 400/zoom;
        upButton.y = viewport.y + 800/zoom;
        downButton.x = viewport.x + 400/zoom;
        downButton.y = viewport.y + 940/zoom;
        leftButton.x = viewport.x + 325/zoom;
        leftButton.y = viewport.y + 870/zoom;
        rightButton.x = viewport.x + 475/zoom;
        rightButton.y = viewport.y + 870/zoom;
        upButton.setScale(1.2/zoom); 
        downButton.setScale(1.2/zoom);
        leftButton.setScale(1.2/zoom);
        rightButton.setScale(1.2/zoom);

        this.updateVisibleTiles(this.player, this.map, this.layer, this.stepOption.nstep) ;
        this.collectCoin(this.player, this.coins);
        this.updatePointer(this.coins, this.player, this.pointer);

        // 获取指定坐标位置的Tile对象
        var tile = this.layer.getTileAtWorldXY(this.coins.x, this.coins.y); // 假设worldX和worldY是你要检查的坐标位置
        if (tile && tile._visible) {
            this.coins.setDepth(1);
            this.coins.setVisible(true);
        }else{
            this.coins.setVisible(false);
        }

        // Smooth follow the player
        var smoothFactor = 0.9;
        this.cam.scrollX = smoothFactor * this.cam.scrollX + (1 - smoothFactor) * (this.player.x - this.cam.width * 0.5);
        this.cam.scrollY = smoothFactor * this.cam.scrollY + (1 - smoothFactor) * (this.player.y - this.cam.height * 0.5);
    }

    updateVisibleTiles(player, map, layer, nstep) {
        const tileSize = 16; // Tile的尺寸
        const matrixSize = 3; // 矩阵的大小
        const matrixSpacing = 3; // 矩阵之间的间距（以tile为单位）
        const totalMatrixSize = matrixSize + matrixSpacing; // 矩阵加上间距的总大小 = 6
    
        // 隐藏所有tiles
        layer.forEachTile(tile => tile.setVisible(false));
    
        for (var i = 0; i < nstep; i++) {
            if (i === 0) {
                // 计算玩家当前所在的矩阵坐标
                matrixX = Math.floor(player.x / (tileSize * totalMatrixSize));
                matrixY = Math.floor(player.y / (tileSize * totalMatrixSize));
                this.showVisibleTiles (matrixX, matrixY, map, layer)
            }else{
                // left tile
                matrixX = matrixX - i;
                matrixY = matrixY;
                this.showVisibleTiles (matrixX, matrixY, map, layer)
                // right tile
                matrixX = matrixX + i;
                matrixY = matrixY;
                this.showVisibleTiles (matrixX, matrixY, map, layer)
                // up tile
                matrixX = matrixX;
                matrixY = matrixY - i;
                this.showVisibleTiles (matrixX, matrixY, map, layer)
                // down tile
                matrixX = matrixX;
                matrixY = matrixY + i;
                this.showVisibleTiles (matrixX, matrixY, map, layer)
            }

        }
        
    }

    showVisibleTiles (matrixX, matrixY, map, layer) {
        const matrixSize = 3; // 矩阵的大小
        const matrixSpacing = 3; // 矩阵之间的间距（以tile为单位）
        const totalMatrixSize = matrixSize + matrixSpacing; // 矩阵加上间距的总大小 = 6

        // 显示当前矩阵的tiles
        for (let x = matrixX * totalMatrixSize-matrixSpacing; x < (matrixX + 1) * totalMatrixSize; x++) {
            for (let y = matrixY * totalMatrixSize-matrixSpacing; y < (matrixY + 1) * totalMatrixSize; y++) {
                // 检查tile是否在地图范围内
                if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                    let tile = map.getTileAt(x, y, true, layer);
                    if (tile) {
                        tile.setVisible(true);
                    }
                }
            }
        }
        // 显示水平方向上左侧的相邻矩阵的tiles
        let left_x = matrixX * totalMatrixSize - 1;
        let left_y = matrixY * totalMatrixSize + 1;
        let left_tile = map.getTileAt(left_x, left_y, true, layer);
        if (left_tile != null && left_tile.index != -1){
            for (let x = (matrixX-1) * totalMatrixSize - matrixSpacing; x < matrixX * totalMatrixSize; x++) {
                for (let y = matrixY * totalMatrixSize - matrixSpacing; y < (matrixY + 1) * totalMatrixSize; y++) {
                    // 检查tile是否在地图范围内
                    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                        let tile = map.getTileAt(x, y, true, layer);
                        if (tile) {
                            tile.setVisible(true);
                        }
                    }
                }
            }
        }
        // 显示水平方向上右侧相邻矩阵的tiles
        let right_x = matrixX * totalMatrixSize + 3;
        let right_y = matrixY * totalMatrixSize + 1;
        let right_tile = map.getTileAt(right_x, right_y, true, layer);
        if (right_tile != null && right_tile.index != -1){
            for (let x = (matrixX+1) * totalMatrixSize - matrixSpacing; x < (matrixX+2) * totalMatrixSize; x++) {
                for (let y = matrixY * totalMatrixSize - matrixSpacing; y < (matrixY + 1) * totalMatrixSize; y++) {
                    // 检查tile是否在地图范围内
                    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                        let tile = map.getTileAt(x, y, true, layer);
                        if (tile) {
                            tile.setVisible(true);
                        }
                    }
                }
            }
        }
        // 显示垂直方向上的上方相邻矩阵的tiles
        let up_x = matrixX * totalMatrixSize+1;
        let up_y = matrixY * totalMatrixSize-1;
        let up_tile = map.getTileAt(up_x, up_y, true, layer);
        if (up_tile != null && up_tile.index != -1){
            for (let x = matrixX * totalMatrixSize-matrixSpacing; x < (matrixX + 1) * totalMatrixSize; x++) {
                for (let y = (matrixY-1) * totalMatrixSize - matrixSpacing; y < matrixY * totalMatrixSize; y++) {
                    // 检查tile是否在地图范围内
                    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                        let tile = map.getTileAt(x, y, true, layer);
                        if (tile) {
                            tile.setVisible(true);
                        }
                    }
                }
            }
        }
        // 显示垂直方向上的下方相邻矩阵的tiles
        let down_x = matrixX * totalMatrixSize+1;
        let down_y = matrixY * totalMatrixSize+3;
        let down_tile = map.getTileAt(down_x, down_y, true, layer);
        if (down_tile != null && down_tile.index != -1){
            for (let x = matrixX * totalMatrixSize-matrixSpacing; x < (matrixX + 1) * totalMatrixSize; x++) {
                for (let y = (matrixY+1) * totalMatrixSize - matrixSpacing; y < (matrixY+2) * totalMatrixSize; y++) {
                    // 检查tile是否在地图范围内
                    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                        let tile = map.getTileAt(x, y, true, layer);
                        if (tile) {
                            tile.setVisible(true);
                        }
                    }
                }
            }
        }
    }
    collectCoin(player, coin) {
        if (!coin.collected && Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), new Phaser.Geom.Rectangle(coin.x, coin.y, 27, 32))) {
            coin.collected = true;
            nCoins++;
            // 更新界面左上角的金币数量显示
            coinText.setText('金币：' + nCoins);
            // 添加一个Tween动画来让金币飞入左上角的金币数量显示处
            this.tweens.add({
                targets: coin,
                x: coinText.x + 20,
                y: coinText.y + 20,
                duration: 1000,
                onComplete: function(tween) {
                coin.visible = false;
                }
            });
            // 当玩家获取金币之后，再添加一个新的金币
            this.addNewCoin();
        }
        
      }
    addNewCoin() {
        let coinCenter = Phaser.Math.RND.pick(matrixCenters);
        this.coins = this.add.image(coinCenter.x, coinCenter.y, 'star');
        this.tweens.add({
            targets: this.coins,
            angle: 90,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    
    updatePointer(coin, player, pointer) {
        // 获取相机的缩放比例
        const zoom = this.cam.zoom;
        const viewRect = this.cam.worldView;

        // 获取视图矩形的上下左右坐标位置
        var top = viewRect.y;
        var bottom = viewRect.y + viewRect.height;
        var left = viewRect.x;
        var right = viewRect.x + viewRect.width;

        // console.log(visibleHeight);
        // 计算玩家和金币的相对位置
        const dx = coin.x - player.x;
        const dy = coin.y - player.y;

        // 计算指示针的角度
        const angle = Phaser.Math.Angle.Between(player.x, player.y, coin.x, coin.y);

        // 更新指示针的位置
        pointer.x = player.x + dx / zoom;
        pointer.y = player.y + dy / zoom;

        // 确保指示针在相机的可视范围内
        pointer.x = Phaser.Math.Clamp(pointer.x, left+8, right-8);
        pointer.y = Phaser.Math.Clamp(pointer.y, top+8, bottom-8);

        // 更新指示针的角度
        pointer.rotation = angle;

    }

}



const config = {
    type: Phaser.AUTO,
    width: 810,
    height: 1100,
    backgroundColor: '#A9A9A9',
    pixelArt: true,
    scene: maze,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
};


const game = new Phaser.Game(config);


function resizeApp () {
    // // Check if device DPI messes up the width-height-ratio
    let canvas  = document.getElementsByTagName('canvas')[0];
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio =  game.config.width / game.config.height;
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    } else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
};
window.addEventListener('resize', resizeApp);