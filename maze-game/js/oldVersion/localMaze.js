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


export class localMaze extends Phaser.Scene
{
    constructor(){

        super({
            key: 'localMaze'
        })

        this.player;
        this.joystick;
        this.map;
        this.water;
        this.layer
        this.grass;
        this.desert;
        this.tree;
        this.road;
        this.coins;
        this.tweens
    }
    
    preload()
    {
        this.load.tilemapTiledJSON('map', './assets/maze-v4.json');

        // load all imgs that we need
        this.load.image('mapPack_spritesheet', 'assets/map-v4/Spritesheet/mapPack_spritesheet.png');
        this.load.image('player', 'assets/map-v4/player.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('pointer', 'assets/pointer.png');
        this.load.image('upButton', 'assets/control/upButton.png');
        this.load.image('downButton', './assets/control/downButton.png');
        this.load.image('leftButton', './assets/control/leftButton.png');
        this.load.image('rightButton', './assets/control/rightButton.png');

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
        var mapPack = this.map.addTilesetImage("mapPack_spritesheet", "mapPack_spritesheet");
        this.water = this.map.createLayer('water', [mapPack]);
        this.grass = this.map.createLayer('grass', [mapPack]);
        this.desert = this.map.createLayer('desert', [mapPack]);
        this.tree = this.map.createLayer('tree', [mapPack]);
        this.road = this.map.createLayer('road', [mapPack]);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        
        // get all start point and add player randomly
        let tileWidth = 64;
        let tileHeight = 64;
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                let centerX = 128 + i * (2 * tileWidth) + 0.5 * tileWidth;
                let centerY = 320 + j * (2 * tileHeight) + 0.5 * tileHeight;
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
        this.coins.setDepth(1);
        this.tweens.add({
            targets: this.coins,
            angle: 90,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.player = this.add.sprite(playerCenter.x, playerCenter.y, 'player').setScale(1.5);
        this.pointer = this.add.sprite(0, 0, 'pointer').setScale(4);
        this.pointer.setOrigin(0.5);
        this.pointer.setDepth(1);


        // add coin count text
        coinText = this.add.text(18, 18, "星星：" + nCoins, {
                fontSize: '22px',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
                fill: "#FFD700",
                padding: { x: 20, y: 10 },
                backgroundColor: "#000000"
            }).setOrigin(0);
        coinText.setDepth(1);


        // 创建控制按钮
        upButton = this.add.image(400, 780, 'upButton').setInteractive();
        downButton = this.add.image(400, 920, 'downButton').setInteractive();
        leftButton = this.add.image(330, 850, 'leftButton').setInteractive();
        rightButton = this.add.image(470, 850, 'rightButton').setInteractive();
        upButton.setOrigin(0.5); upButton.setDepth(1);
        downButton.setOrigin(0.5); downButton.setDepth(1);
        leftButton.setOrigin(0.5); leftButton.setDepth(1);
        rightButton.setOrigin(0.5); rightButton.setDepth(1);


        // 监听按钮点击事件
        var TILE_SIZE = 64;
        upButton.on('pointerdown', event => {
            const tile = this.road.getTileAtWorldXY(this.player.x, this.player.y - 64, true);
            if (tile && tile.index != -1){
                this.player.y -= 2 * TILE_SIZE;
            }
        });
        downButton.on('pointerdown', event => {
            const tile = this.road.getTileAtWorldXY(this.player.x, this.player.y + 64, true);
            if (tile && tile.index != -1){
                this.player.y += 2 * TILE_SIZE;
            }
        });
        leftButton.on('pointerdown', event => {
            const tile = this.road.getTileAtWorldXY(this.player.x - 64, this.player.y, true);
            if (tile && tile.index != -1){
                this.player.x -= 2 * TILE_SIZE;
            }
        });
        rightButton.on('pointerdown', event => {
            const tile = this.road.getTileAtWorldXY(this.player.x + 64, this.player.y, true);
            if (tile && tile.index != -1){
                this.player.x += 2 * TILE_SIZE;
            }else{
                console.log(tile);
            }
        });


        // add camera
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        if (windowHeight < windowWidth) {
            var zoomSize = windowHeight/2368;
        }else{
            var zoomSize = windowWidth/1088;
        }
        
        this.cam = this.cameras.main;
        this.cam.startFollow(this.player);
        this.cam.setZoom(zoomSize);
        this.cam.setBounds(0, 0, this.water.width * this.water.scaleX, this.water.height * this.water.scaleY);
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
        let canvas  = document.getElementsByTagName('canvas')[0];
        const zoom = this.cameras.main.zoom;
        coinText.x = viewport.x + 20/zoom;
        coinText.y = viewport.y + 20/zoom;
        coinText.setScale(1/zoom);

        upButton.x = viewport.x + canvas.width/(2*zoom);
        upButton.y = viewport.y + (canvas.height*6.05/8)/zoom;

        downButton.x = viewport.x + canvas.width/(2*zoom);
        downButton.y = upButton.y + 230/zoom;

        leftButton.x = upButton.x - 115/zoom;
        leftButton.y = upButton.y + 115/zoom;

        rightButton.x = upButton.x + 115/zoom;
        rightButton.y = upButton.y + 115/zoom;

        upButton.setScale(1/zoom); 
        downButton.setScale(1/zoom);
        leftButton.setScale(1/zoom);
        rightButton.setScale(1/zoom);

        this.updateVisibleTiles(this.player, this.map, this.road, this.stepOption.nstep) ;
        this.collectCoin(this.player, this.coins);
        this.updatePointer(this.coins, this.player, this.pointer);

        // 获取指定坐标位置的Tile对象
        var tile = this.road.getTileAtWorldXY(this.coins.x, this.coins.y); // 假设worldX和worldY是你要检查的坐标位置
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
        const tileSize = 64; // Tile的尺寸
    
        // 隐藏所有tiles
        layer.forEachTile(tile => tile.setVisible(false));
    
        for (var i = 0; i < nstep; i++) {
            if (i === 0) {
                // 计算玩家当前所在的矩阵坐标
                matrixX = Math.floor(player.x / tileSize);
                matrixY = Math.floor(player.y / tileSize);
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
        const matrixSize = 1; // 矩阵的大小
        const matrixSpacing = 1; // 矩阵之间的间距（以tile为单位）
        const totalMatrixSize = matrixSize + matrixSpacing; // 矩阵加上间距的总大小 = 6

        // 显示当前矩阵的tiles
        for (let x = matrixX - matrixSpacing; x < matrixX + totalMatrixSize; x++) {
            for (let y = matrixY - matrixSpacing; y < matrixY + totalMatrixSize; y++) {
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
        let left_x = matrixX - matrixSpacing;
        let left_y = matrixY;
        let left_tile = map.getTileAt(left_x, left_y, true, layer);
        if (left_tile != null && left_tile.index != -1){
            for (let x = matrixX - totalMatrixSize - matrixSpacing; x < matrixX; x++) {
                for (let y = matrixY - matrixSpacing; y < matrixY + totalMatrixSize; y++) {
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
        let right_x = matrixX + matrixSpacing;
        let right_y = matrixY;
        let right_tile = map.getTileAt(right_x, right_y, true, layer);
        if (right_tile != null && right_tile.index != -1){
            for (let x = matrixX + totalMatrixSize - matrixSpacing; x < matrixX + 2*totalMatrixSize; x++) {
                for (let y = matrixY  - matrixSpacing; y < matrixY +  totalMatrixSize; y++) {
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
        let up_x = matrixX;
        let up_y = matrixY - matrixSpacing;
        let up_tile = map.getTileAt(up_x, up_y, true, layer);
        if (up_tile != null && up_tile.index != -1){
            for (let x = matrixX - matrixSpacing; x < matrixX + totalMatrixSize; x++) {
                for (let y = matrixY - totalMatrixSize - matrixSpacing; y < matrixY; y++) {
                    // 检查tile是否在地图范围内
                    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                        let tile = map.getTileAt(x, y, true, layer);
                        if (tile) {
                            tile.setVisible(true);
                        }
                    }
                }
            }
        }else{
            console.log(up_tile)
        }
        // 显示垂直方向上的下方相邻矩阵的tiles
        let down_x = matrixX;
        let down_y = matrixY + matrixSpacing;
        let down_tile = map.getTileAt(down_x, down_y, true, layer);
        if (down_tile != null && down_tile.index != -1){
            for (let x = matrixX - matrixSpacing; x < matrixX + totalMatrixSize; x++) {
                for (let y = matrixY + totalMatrixSize - matrixSpacing; y < matrixY + 2* totalMatrixSize; y++) {
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
        const zoom = this.cam.zoom;
        if (!coin.collected && Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), new Phaser.Geom.Rectangle(coin.x, coin.y, 27, 32))) {
            coin.collected = true;
            nCoins++;
            // 更新界面左上角的金币数量显示
            coinText.setText('星星：' + nCoins);
            // 添加一个Tween动画来让金币飞入左上角的金币数量显示处
            this.tweens.add({
                targets: coin,
                x: coinText.x + 20/zoom,
                y: coinText.y + 20/zoom,
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
        pointer.x = player.x + dx;
        pointer.y = player.y + dy;

        // 确保指示针在相机的可视范围内
        pointer.x = Phaser.Math.Clamp(pointer.x, left+64/zoom, right-64/zoom);
        pointer.y = Phaser.Math.Clamp(pointer.y, top+64/zoom, bottom-64/zoom);

        // 更新指示针的角度
        pointer.rotation = angle;

    }

}






// function resizeApp () {
//     // // Check if device DPI messes up the width-height-ratio
//     let canvas  = document.getElementsByTagName('canvas')[0];
//     var windowWidth = window.innerWidth;
//     var windowHeight = window.innerHeight;
//     var windowRatio = windowWidth / windowHeight;
//     var gameRatio =  game.config.width / game.config.height;
//     if (windowRatio < gameRatio) {
//         canvas.style.width = windowWidth + "px";
//         canvas.style.height = (windowWidth / gameRatio) + "px";
//     } else {
//         canvas.style.width = (windowHeight * gameRatio) + "px";
//         canvas.style.height = windowHeight + "px";
//     }
// };
// window.addEventListener('resize', resizeApp);