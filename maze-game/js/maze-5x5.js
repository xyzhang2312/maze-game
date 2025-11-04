var timeText
var matrixCenters = [];
let upButton
let downButton
let rightButton
let leftButton
let starCoordinates
var width
var height
let road
let grass
var remainingTime = 5;
let graphics
let lastPosition
var trial = 0;
const nTrials = 4;


export class maze5x5 extends Phaser.Scene
{
    constructor(){

        super({
            key: 'maze5x5'
        })

        this.map;
        this.water;

    }
    
    preload() {
        this.load.tilemapTiledJSON('map5x5', './maze-game/assets/maze-5x5.json');
        // load all imgs that we need
        this.load.image('mapPack_spritesheet', './maze-game/assets/map-v4/Spritesheet/mapPack_spritesheet.png');
        this.load.image('player', './maze-game/assets/map-v4/player.png');
        this.load.image('star', './maze-game/assets/star.png');
        this.load.image('upButton', './maze-game/assets/control/upButton.png');
        this.load.image('downButton', './maze-game/assets/control/downButton.png');
        this.load.image('leftButton', './maze-game/assets/control/leftButton.png');
        this.load.image('rightButton', './maze-game/assets/control/rightButton.png');
    }
    create() {

        height = this.sys.game.config.height;
        width = this.sys.game.config.width;

        // create grid array for road layer
        var isConnected = false;
        const rows = 9;
        const cols = 9;
        const brokenRate = 0.35;

        while (!isConnected) {
            var grid = this.createGrid(rows, cols, brokenRate);
            var isConnected = this.isGridConnected(grid);
            if (isConnected === true) {
                break
            }
        }

        // add 0 for
        grid.unshift(new Array(cols).fill(0)); // 在开头添加一行0
        grid.push(new Array(cols).fill(0)); // 在末尾添加一行0
        for (let i = 0; i < grid.length; i++) {
            grid[i].unshift(0); // 在每一行的开头添加一个0
            grid[i].push(0); // 在每一行的末尾添加一个0
        }

        
        console.log(grid);
        console.log(isConnected);

        this.map = this.make.tilemap({ key: 'map5x5' });
        var mapPack = this.map.addTilesetImage("mapPack_spritesheet", "mapPack_spritesheet");
        this.water = this.map.createLayer('water', [mapPack]);
        grass = this.map.createLayer('grass', [mapPack]);
        this.fullroad = this.map.createLayer('road', [mapPack]);
        this.fullroad.setVisible(false);
        
        // 检查是否已经存在matrix
        if (!this.registry.get('roadMatrix')) {
            const matrix = this.createMatrix (grid, rows, cols);
            this.registry.set('roadMatrix', matrix);
            this.map2 = this.make.tilemap({ tileWidth: 64, tileHeight: 64, data: this.registry.get('roadMatrix') });
            road = this.map2.createLayer(0, mapPack, 0, 0)
        } else {
            console.log(1);
            this.map2 = this.make.tilemap({ tileWidth: 64, tileHeight: 64, data: this.registry.get('roadMatrix') });
            road = this.map2.createLayer(0, mapPack, 0, 0)
        }
        
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        road.setVisible(false);
        grass.setVisible(false);

        // get all start point and add player randomly
        let tileWidth = 64;
        let tileHeight = 64;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let centerX = 128 + i * (2 * tileWidth) + 0.5 * tileWidth;
                let centerY = 256 + j * (2 * tileHeight) + 0.5 * tileHeight;
                matrixCenters.push({ x: centerX, y: centerY });
            }
        }

        // 创建控制按钮
        upButton = this.add.image(400, 780, 'upButton').setInteractive();
        downButton = this.add.image(400, 920, 'downButton').setInteractive();
        leftButton = this.add.image(330, 850, 'leftButton').setInteractive();
        rightButton = this.add.image(470, 850, 'rightButton').setInteractive();
        
        upButton.setOrigin(0.5); upButton.setDepth(1);
        downButton.setOrigin(0.5); downButton.setDepth(1);
        leftButton.setOrigin(0.5); leftButton.setDepth(1);
        rightButton.setOrigin(0.5); rightButton.setDepth(1);

        upButton.setVisible(false);
        downButton.setVisible(false);
        leftButton.setVisible(false);
        rightButton.setVisible(false);
        
        displayInfoPanel(this);
        this.events.once('trialEnd', () => {tiralEnd(this)}, this)

        // 监听按钮点击事件
        var TILE_SIZE = 64;
        upButton.on('pointerdown', event => {
            const tile = road.getTileAtWorldXY(this.player.x, this.player.y - 64, true);
            if (tile && tile.index != 0){
                this.player.y -= 2 * TILE_SIZE;
            }
        });
        downButton.on('pointerdown', event => {
            const tile = road.getTileAtWorldXY(this.player.x, this.player.y + 64, true);
            if (tile && tile.index != 0){
                this.player.y += 2 * TILE_SIZE;
            }
        });
        leftButton.on('pointerdown', event => {
            const tile = road.getTileAtWorldXY(this.player.x - 64, this.player.y, true);
            if (tile && tile.index != 0){
                this.player.x -= 2 * TILE_SIZE;
            }
        });
        rightButton.on('pointerdown', event => {
            const tile = road.getTileAtWorldXY(this.player.x + 64, this.player.y, true);
            if (tile && tile.index != 0){
                this.player.x += 2 * TILE_SIZE;
            }
        });


        this.cam = this.cameras.main;
        this.cam.setZoom(1.31);
        this.cam.setBounds(0, 0, this.water.width * this.water.scaleX, this.water.height * this.water.scaleY);
    }

    
    
    update (time, delta)
    {
        // change the text location and do not change font size
        const viewport = this.cameras.main.worldView;
        let canvas  = document.getElementsByTagName('canvas')[0];
        const zoom = this.cameras.main.zoom;
        // timeText.x = viewport.x + 20/zoom;
        // timeText.y = viewport.y + 20/zoom;
        // timeText.setScale(1/zoom);

        // change button location
        upButton.x = viewport.x + canvas.width/(2*zoom);
        upButton.y = viewport.y + (canvas.height*6.05/8)/zoom;

        downButton.x = viewport.x + canvas.width/(2*zoom);
        downButton.y = upButton.y + 300/zoom;

        leftButton.x = upButton.x - 145/zoom;
        leftButton.y = upButton.y + 145/zoom;

        rightButton.x = upButton.x + 145/zoom;
        rightButton.y = upButton.y + 145/zoom;

        upButton.setScale(1.3/zoom); 
        downButton.setScale(1.3/zoom);
        leftButton.setScale(1.3/zoom);
        rightButton.setScale(1.3/zoom);

        // this.updateVisibleTiles(this.player, this.map, road, this.stepOption.nstep);
        // this.collectStar(this.player, this.star);

        // Smooth follow the player
        // var smoothFactor = 0.9;
        // this.cam.scrollX = smoothFactor * this.cam.scrollX + (1 - smoothFactor) * (this.player.x - this.cam.width * 0.5);
        // this.cam.scrollY = smoothFactor * this.cam.scrollY + (1 - smoothFactor) * (this.player.y - this.cam.height * 0.5);

        // 绘制轨迹
        if (grass.visible === true) {
            graphics.lineStyle(5, 0xff0000, 1);
            graphics.beginPath();
            graphics.moveTo(lastPosition.x, lastPosition.y);
            graphics.lineTo(this.player.x, this.player.y);
            graphics.closePath();
            graphics.strokePath();
            // 更新上一个位置
            lastPosition.x = this.player.x;
            lastPosition.y = this.player.y;
        }


        if (trial == nTrials) {
            this.nextScene();
        }

    }

    isGridConnected(grid) {
        const rows = grid.length;
        const cols = grid[0].length;
        const visited = new Array(rows).fill(false).map(() => new Array(cols).fill(false));
        
        function isValid(row, col) {
          return row >= 0 && row < rows && col >= 0 && col < cols;
        }
        
        function dfs(row, col) {
          if (isValid(row, col) && grid[row][col] != 0 && !visited[row][col]) {
            visited[row][col] = true;
            dfs(row-1, col);
            dfs(row+1, col);
            dfs(row, col-1);
            dfs(row, col+1);
          }
        }
        
        // Find the starting point
        let startRow = -1;
        let startCol = -1;
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
              startRow = i;
              startCol = j;
              break;
            }
          }
          if (startRow !== -1) {
            break;
          }
        }
        
        // Perform DFS
        dfs(startRow, startCol);
        
        // Check if all 1s are visited
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1 && !visited[i][j]) {
              return false;
            }
          }
        }
        
        return true;
      }
  
    createGrid(rows, cols, brokenRate) {
        const grid = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
              if (i % 2 === 0 && j % 2 === 0) {
                row.push(1); // 偶数行偶数列
              } else if (i % 2 === 1 && j % 2 === 0) {
                row.push(2); // 奇数行偶数列
              } else if (i % 2 === 0 && j % 2 === 1) {
                row.push(2); // 偶数行奇数列
              } else {
                row.push(0); // 奇数行奇数列
              }
            }
            grid.push(row);
        }

        // 分别统计偶数行和奇数行中数字2的位置
        const twosInRows = [];
        const twosInCols = [];
        for (let i = 0; i < rows; i += 2) { // 偶数行
            for (let j = 0; j < cols; j += 1) {
                if (grid[i][j] === 2) {
                    twosInRows.push({ row: i, col: j });
                }
            }
        }
        for (let i = 1; i < rows; i += 2) { // 奇数行
            for (let j = 0; j < cols; j += 1) {
                if (grid[i][j] === 2) {
                    twosInCols.push({ row: i, col: j });
                }
            }
        }

        // 确定需要替换的数量
        const numToReplace = Math.min(
            Math.floor(twosInRows.length * brokenRate),
            Math.floor(twosInCols.length * brokenRate)
        );

        // 随机替换数字2
        for (let i = 0; i < numToReplace; i++) {
            const randomRowIndex = Math.floor(Math.random() * twosInRows.length);
            const { row: rowToReplace, col: colInRow } = twosInRows[randomRowIndex];
            grid[rowToReplace][colInRow] = 0;
            twosInRows.splice(randomRowIndex, 1);

            const randomColIndex = Math.floor(Math.random() * twosInCols.length);
            const { row: rowInCol, col: colToReplace } = twosInCols[randomColIndex];
            grid[rowInCol][colToReplace] = 0;
            twosInCols.splice(randomColIndex, 1);
        }

        return grid;
    }

    createMatrix (grid, rows, cols) {
        // road layer matrix
        var matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
              matrix[i][j] = 0;
            }
        }
        // 在矩阵的上下各添加一行0
        matrix.unshift(new Array(cols).fill(0)); // 在开头添加一行0
        matrix.push(new Array(cols).fill(0)); // 在末尾添加一行0

        // 在矩阵的左右各添加一列0
        for (let i = 0; i < matrix.length; i++) {
            matrix[i].unshift(0); // 在每一行的开头添加一个0
            matrix[i].push(0); // 在每一行的末尾添加一个0
        }
        // inner matrix
        for (let i = 1; i < grid.length; i += 2){
            for (let j = 1; j < grid.length; j += 2) { 
                if ( grid[i-1][j] === 2 && grid[i+1][j] === 2 && grid[i][j-1] === 2 && grid[i][j+1] === 2 ) {
                    matrix[i][j] = 31;
                } else if (grid[i-1][j] != 2 && grid[i+1][j] === 2 && grid[i][j-1] ===2 && grid[i][j+1] === 2) {
                    matrix[i][j] = 73;
                } else if (grid[i-1][j] != 2 && grid[i+1][j] != 2 && grid[i][j-1] ===2 && grid[i][j+1] === 2) {
                    matrix[i][j] = 45;
                } else if (grid[i-1][j] != 2 && grid[i+1][j] === 2 && grid[i][j-1] != 2 && grid[i][j+1] === 2) {
                    matrix[i][j] = 101;
                } else if (grid[i-1][j] === 2 && grid[i+1][j] === 2 && grid[i][j-1] != 2 && grid[i][j+1] != 2) {
                    matrix[i][j] = 59;
                } else if (grid[i-1][j] === 2 && grid[i+1][j] === 2 && grid[i][j-1] === 2 && grid[i][j+1] != 2) {
                    matrix[i][j] = 2;
                } else if (grid[i-1][j] != 2 && grid[i+1][j] === 2 && grid[i][j-1] === 2 && grid[i][j+1] != 2) {
                    matrix[i][j] = 87;
                } else if (grid[i-1][j] === 2 && grid[i+1][j] != 2 && grid[i][j-1] === 2 && grid[i][j+1] === 2) {
                    matrix[i][j] = 30;
                } else if (grid[i-1][j] === 2 && grid[i+1][j] != 2 && grid[i][j-1] != 2 && grid[i][j+1] === 2) {
                    matrix[i][j] = 58;
                } else if (grid[i-1][j] === 2 && grid[i+1][j] != 2 && grid[i][j-1] === 2 && grid[i][j+1] != 2) {
                    matrix[i][j] = 44;
                } else if (grid[i-1][j] === 2 && grid[i+1][j] === 2 && grid[i][j-1] != 2 && grid[i][j+1] === 2) {
                    matrix[i][j] = 16;
                } else if (grid[i-1][j] != 2 && grid[i+1][j] != 2 && grid[i][j-1] === 2 && grid[i][j+1] != 2) {
                    matrix[i][j] = 3;
                } else if (grid[i-1][j] != 2 && grid[i+1][j] != 2 && grid[i][j-1] != 2 && grid[i][j+1] === 2) {
                    matrix[i][j] = 155;
                } else if (grid[i-1][j] === 2 && grid[i+1][j] != 2 && grid[i][j-1] != 2 && grid[i][j+1] != 2) {
                    matrix[i][j] = 169;
                } else if (grid[i-1][j] != 2 && grid[i+1][j] === 2 && grid[i][j-1] != 2 && grid[i][j+1] != 2) {
                    matrix[i][j] = 17;
                }
            }
        }

        for (let i = 1; i < grid.length; i += 1) {
            for (let j = 1; j < grid.length; j += 1) {
                if (grid[i][j] === 0) {
                    matrix[i][j] = 0;
                } else if (grid[i][j] === 2 && i % 2 === 0) { 
                    matrix[i][j] = 145;
                } else if (grid[i][j] === 2 && j % 2 === 0) { 
                    matrix[i][j] = 131;
                }
            }
        }

        // 在矩阵的上方添加4行0
        for (let i = 0; i < 3; i++) {
            matrix.unshift(new Array(cols).fill(0)); // 在开头添加一行0
        }

        // 在矩阵的下方添加10行0
        for (let i = 0; i < 18; i++) {
            matrix.push(new Array(cols).fill(0)); // 在末尾添加一行0
        }

        // 在矩阵的左右各添加一列0
        for (let i = 0; i < matrix.length; i++) {
            matrix[i].unshift(0); // 在每一行的开头添加一个0
            matrix[i].push(0,0); // 在每一行的末尾添加一个0
        }
        return matrix
    }

}

var displayInfoPanel = function(scene) {
    var mainTxt = (
        "Practice 1-" + (trial+1)
    );
    var buttonTxt = 'start';

    new createInstrPanel (scene, width, height, mainTxt, buttonTxt)

    scene.events.once('trialStart', () => {trialStart(scene)}, scene);
}

var trialStart = function(scene) {
    // create map and add tileset
    road.setVisible(true);
    grass.setVisible(true);

    upButton.setVisible(true);
    downButton.setVisible(true);
    leftButton.setVisible(true);
    rightButton.setVisible(true);
    // add player and stars
    const coordinates = getRandomCoordinates (matrixCenters, 2);
    const playerCenter = coordinates[0];
    starCoordinates = coordinates[1];
    // scene.addNewStar();
    scene.star = scene.physics.add.sprite (starCoordinates.x, starCoordinates.y, 'star');
    scene.tweens.add ({
                targets: scene.star,
                angle: 90,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
    });
    scene.player = scene.physics.add.sprite (playerCenter.x, playerCenter.y, 'player').setScale(1.5);
    scene.player.setDepth(1);
    scene.player.setVisible(false);
    scene.star.setVisible(false);
    scene.star.collected = false;
    scene.time.delayedCall (5000, function(){
        road.setVisible(false);
        scene.fullroad.setVisible(true);
        scene.fullroad.setAlpha(0.5);
        scene.player.setVisible(true);
        scene.star.setVisible(true);
    }, [], scene);
    
    scene.timer = scene.time.addEvent({
        delay: 1000,
        callback: onTimerTick,
        callbackScope: scene,
        loop: true,
    });
    timeText = scene.add.text(50, 50, "Time left：5", {
            fontSize: 40/1.31 +'px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
            fill: "#FFD700",
            padding: { x: 20, y: 10 },
            backgroundColor: "#000000"
        }).setOrigin(0);
    timeText.setDepth(1);

    graphics = scene.add.graphics();

    lastPosition = { x: scene.player.x, y: scene.player.y };

    scene.physics.add.collider(scene.player, scene.star, 
        function () {
            scene.star.destroy();
            scene.player.destroy();
            graphics.destroy();
            scene.events.emit('trialEnd');
        }, null, scene);
}
 var tiralEnd = function(scene){
    trial++;
    scene.scene.restart();
    remainingTime = 5;
 }

var createInstrPanel = function (scene, width, height, mainTxt, buttonTxt) {
    
    var dialog = createDialog(scene, width, height, mainTxt, buttonTxt);

    dialog
        .once('button.click', function (button) {
            dialog.scaleDownDestroy();                     // destroy panel components
            this.events.emit('trialStart');                // emit completion event
        }, scene)
        .on('button.over', function (button) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        .on('button.out', function (button) {
            button.getElement('background').setStrokeStyle();
        });
}

var createDialog = function (scene, width, height, mainTxt, buttonTxt) {
    var dialog = scene.rexUI.add.dialog({
        x: width/2.62,
        y: height/2.62,

        background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0).setAlpha(0.5),
        
        content: scene.add.text(0, 0, mainTxt,{
            fontSize: 60,
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
            content: 30,
            action: 15,
            left: 30,
            right: 30,
            top: 30,
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
            fontSize: 52,
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


var onTimerTick = function() {
    remainingTime--
    timeText.setText('Time left：' + remainingTime);

    if (remainingTime == 0) {
        this.timer.remove(false);
        timeText.setVisible(false);
    }
}

var getRandomCoordinates = function (array, num) {
    const result = [];
    const tempArray = array.slice(); // Copy a coordinate array to avoid modifying the original array
    for (let i = 0; i < num; i++) {
        const randomIndex = Math.floor(Math.random() * tempArray.length);
        const selectedCoordinate = tempArray.splice(randomIndex, 1)[0];
        result.push(selectedCoordinate);
    }
    return result;
}

export {width, height}

