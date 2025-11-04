var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    parent: 'phaser-example',
    pixelArt: true,
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('mario-tiles', 'assets/tilemaps/tileGrass.png');
}

function create() {
    var level = [
        [ 1, 1, 1, 1, 1],
        [ 2, 2, 2, 2, 2],
        // ,  2,  3,  4,  7,  7,  7
        // [ 5,  6,  7,  7,  4,  4,  7],
        // [ 9, 10, 11, 12,  4,  4,  7],
        // [13, 14, 15, 16,  7,  7,  7],
        // [13, 14, 15, 16,  17,  18,  19]
    ]
    var map = this.make.tilemap({data: level, tileWidth: 64, tileHeight: 100, insertNull: false});
    var tileset = map.addTilesetImage('mario-tiles');
    var layer = map.createLayer(0, tileset);

    layer.setCollision([ 1, 2]);

    // var afterGraphics = this.add.graphics();
    // afterGraphics.x = layer.x;
    // afterGraphics.y = layer.y + 150;
    // afterGraphics.setScale(2, 2);
    // layer.renderDebug(afterGraphics);



    // // 1 - putting & recalc
    // layer.putTileAt(2, 0, 0); // Good - adds left/top faces

}

